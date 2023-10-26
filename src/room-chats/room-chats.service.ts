import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IRoomRequest } from './room-chats.interface';
import { Model } from 'mongoose';
import { Socket as SocketModel } from './models/sockets.model';
import { Room as RoomModel } from './models/rooms.model';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RoomchatsService {
  private logger = new Logger('AppService');
  constructor(
    @InjectModel(SocketModel.name)
    private readonly socketModel: Model<SocketModel>,
    @InjectModel(RoomModel.name)
    private readonly roomModel: Model<RoomModel>,
  ) {
    this.logger.log('constructor');
  }

  async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    const { uuid } = iRoomRequest;
    const data = await this.roomModel.findOne({ uuid });
    if (!data) {
      await this.createRoom(client, iRoomRequest);
    } else {
      await this.updateRoom(client, data, iRoomRequest);
    }
    this.emitEventForUserList(client, server, uuid);
  }

  async createRoom(client: Socket, { nickname, uuid, img }: IRoomRequest) {
    const newRoom = { uuid: uuid, owner: client.id, userList: {} };
    newRoom.userList = { [client.id]: { nickname, img } };
    const data = await this.roomModel.create(newRoom);
    if (!data) {
      await this.roomModel.create({
        uuid,
        owner: client.id,
        userList: null,
      });
    }
    const newUser = { clientId: client.id, uuid: uuid, nickname: nickname };
    await this.socketModel.create(newUser);
  }

  async updateRoom(
    client: Socket,
    roomData: any,
    { uuid, nickname, img }: IRoomRequest,
  ) {
    const newUser = { clientId: client.id, uuid: uuid, nickname: nickname };
    await this.socketModel.create(newUser);
    const findRoom = roomData;
    findRoom.userList[client.id] = { nickname, img };
    await this.roomModel.findOneAndUpdate({ uuid }, findRoom);
  }

  async removeRoom(client: Socket, server: Server, uuid: string) {
    const data = this.roomModel.find({ uuid });
    if (!data) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }
    if (this.isOwner(data, client)) {
      await this.deleteDocumentByUuid(uuid);
      await this.socketModel.deleteMany({ uuid });
      return server.to(uuid).emit('user-list', {});
    }
    client.leave(uuid);
  }

  async leaveRoom(client: Socket, server: Server, uuid: string) {
    const data = await this.roomModel.findOne({ uuid });

    if (!data) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }

    // 유저리스트에서 클라이언트 ID 제거
    delete data.userList[client.id];

    // 업데이트된 데이터를 저장
    await this.roomModel.findOneAndUpdate({ uuid }, data);

    // 클라이언트 ID에 해당하는 사용자를 찾아 삭제
    const user = await this.socketModel
      .findOneAndDelete({ clientId: client.id })
      .exec();

    if (!user) {
      return client
        .to(client.id)
        .emit('error-room', '해당되는 클라이언트 ID를 찾을 수 없습니다.');
    }

    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, uuid);
  }

  isOwner(findRoom: any, client: Socket): boolean {
    const findOwnerNickname = findRoom['userList'][findRoom.owner]?.nickname;
    const findMyNickname = findRoom['userList'][client.id]?.nickname;
    return findOwnerNickname === findMyNickname;
  }

  async disconnectClient(client: Socket, server: Server) {
    // 클라이언트 ID를 기반으로 사용자 정보 조회
    const user = await this.socketModel.findOne({ clientId: client.id });
    if (!user) {
      return client
        .to(client.id)
        .emit('error-room', '해당되는 클라이언트 ID를 찾을 수 없습니다.');
    }

    const uuid = user.uuid;

    // 클라이언트 ID에 해당하는 사용자를 삭제
    await this.socketModel.findOneAndDelete({ clientId: client.id }).exec();

    // 방 정보 조회
    const data = await this.roomModel.findOne({ uuid: uuid });
    if (!data) {
      return client
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }

    // 유저리스트에서 클라이언트 ID 제거
    delete data.userList[client.id];

    // 업데이트된 데이터를 저장
    await this.roomModel.findOneAndUpdate({ uuid }, data);

    // 로깅
    this.logger.log(`disconnected: ${client.id}`);

    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, uuid);
  }

  async emitEventForUserList(client: Socket, server: Server, uuid: string) {
    const data = await this.roomModel.findOne({ uuid });
    if (!data) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }
    server.to(uuid).emit('user-list', data['userList']);
  }

  async deleteDocumentByUuid(uuid: string): Promise<any> {
    const result = await this.roomModel.findOneAndDelete({ uuid }).exec();
    return result;
  }
}
