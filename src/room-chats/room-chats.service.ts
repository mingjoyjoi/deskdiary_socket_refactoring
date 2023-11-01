import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IRoomRequest } from './room-chats.interface';
import { Model } from 'mongoose';
import { Socket as SocketModel } from './models/sockets.model';
import { Room as RoomModel } from './models/rooms.model';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Exception } from './exception/exception';
import axios from 'axios';
import { baseURL } from './constant/url.constant';

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
    const { uuid, nickname, userId } = iRoomRequest;
    const exist = await this.socketModel.findOne({ userId: userId });
    if (exist) {
      return server
        .to(client.id)
        .emit('joinError', '이미 방에 접속한 사용자 입니다.');
    }
    client.join(uuid);
    const data = await this.roomModel.findOne({ uuid });
    if (!data) {
      await this.createRoom(client, iRoomRequest);
    } else {
      await this.updateRoom(client, data, iRoomRequest);
    }
    //return server.to(uuid).emit('new-user', nickname);
    this.emitEventForUserList(client, server, uuid, nickname, 'new-user');
  }

  async createRoom(
    client: Socket,
    { nickname, uuid, img, userId }: IRoomRequest,
  ) {
    const newRoom = { uuid: uuid, owner: client.id, userList: {} };
    newRoom.userList = { [client.id]: { nickname, img } };
    await this.roomModel.create(newRoom);
    const newUser = {
      clientId: client.id,
      uuid: uuid,
      nickname: nickname,
      userId: userId,
    };
    await this.socketModel.create(newUser);
  }

  async updateRoom(
    client: Socket,
    roomData: any,
    { uuid, nickname, img, userId }: IRoomRequest,
  ) {
    const newUser = {
      clientId: client.id,
      uuid: uuid,
      nickname: nickname,
      userId: userId,
    };
    await this.socketModel.create(newUser);
    const findRoom = roomData;
    findRoom.userList[client.id] = { nickname, img };
    await this.roomModel.findOneAndUpdate(
      { uuid },
      { $set: { userList: findRoom.userList } },
    );
  }

  async removeRoom(client: Socket, server: Server, uuid: string) {
    const data = this.roomModel.findOne({ uuid });
    if (!data) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    if (this.isOwner(data, client)) {
      await this.deleteDocumentByUuid(uuid);
      await this.socketModel.deleteMany({ uuid });
      return server.to(uuid).emit('remove-users', {});
    }
    client.leave(uuid);
  }

  async leaveRoom(client: Socket, server: Server, uuid: string) {
    const room = await this.roomModel.findOne({ uuid });
    if (!room) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const userId = room.userList[client.id];
    const nickname = room.userList[client.id]?.nickname;
    if (userId) {
      delete room.userList[client.id];
    } else {
      return server.to(client.id).emit('error-room', Exception.clientNotFound);
    }
    // 방 업데이트
    await this.roomModel.findOneAndUpdate(
      { uuid },
      { $set: { userList: room.userList } },
    );
    // 사용자 데이터 삭제
    await this.socketModel.deleteOne({ clientId: client.id });

    //return server.to(uuid).emit('left-user', nickname);
    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
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
      return server.to(client.id).emit('error-room', Exception.clientNotFound);
    }
    const uuid = user.uuid;
    // 클라이언트 ID에 해당하는 사용자를 삭제
    await this.socketModel.findOneAndDelete({ clientId: client.id }).exec();
    // 방 정보 조회
    const room = await this.roomModel.findOne({ uuid: uuid });
    if (!room) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    // 유저리스트에서 클라이언트 ID 제거
    const nickname = room.userList[client.id]?.nickname;
    delete room.userList[client.id];
    // 업데이트된 데이터를 저장
    await this.roomModel.findOneAndUpdate(
      { uuid },
      { $set: { userList: room.userList } },
    );
    await this.leaveRoomRequestToApiServer(uuid);
    //server.to(uuid).emit('disconnect_user', nickname);
    this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
    this.logger.log(`disconnected: ${client.id}`);
  }

  async emitEventForUserList(
    client: Socket,
    server: Server,
    uuid: string,
    nickname: string,
    userEvent: string,
  ) {
    const data = await this.roomModel.findOne({ uuid });
    if (!data) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const userListObj = data['userList'];
    const userListArr = Object.values(userListObj);

    server.to(uuid).emit(userEvent, { nickname, userListArr });
  }

  async deleteDocumentByUuid(uuid: string): Promise<any> {
    const result = await this.roomModel.findOneAndDelete({ uuid }).exec();
    return result;
  }

  async leaveRoomRequestToApiServer(uuid: string): Promise<void> {
    const headers = {
      'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
    };
    await axios.post(`${baseURL}/room/socket/leave/${uuid}`, undefined, {
      headers,
    });
  }
}
