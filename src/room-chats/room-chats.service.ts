import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IRoomRequest } from './room-chats.interface';
//import axios from 'axios';
import { Model } from 'mongoose';
import { Socket as SocketModel } from './models/sockets.model';
import { Room as RoomModel } from './models/rooms.model';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
//import { baseURL } from './constant/url.constant';

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
  joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    const { uuid, nickname, img } = iRoomRequest;
    //방이 있는지 체크
    const data = this.roomModel.findOne({ uuid });
    if (!data) {
      this.createRoom(client, iRoomRequest);
    } else {
      this.updateRoom(client, data, iRoomRequest);
    }
    server.to(uuid).emit('new_user', { nickname, img });
    //this.emitEventForUserList(client, server, uuid);
  }

  createRoom(client: Socket, { nickname, uuid, img }: IRoomRequest) {
    const newRoom = { uuid: uuid, owner: client.id, userList: {} };
    newRoom.userList = { [client.id]: { nickname, img } };
    this.roomModel.create(newRoom);
    const newUser = { clientId: client.id, uuid: uuid, nickname: nickname };
    this.socketModel.create(newUser);
  }

  updateRoom(
    client: Socket,
    roomData: any,
    { uuid, nickname, img }: IRoomRequest,
  ) {
    const newUser = { clientId: client.id, uuid: uuid, nickname: nickname };
    this.socketModel.create(newUser);
    const findRoom = roomData;
    findRoom.userList[client.id] = { nickname, img };
    this.socketModel.findOne({ uuid }).then((room) => {
      room = findRoom;
      return room.save();
    });
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

    // 오너인 경우 방 삭제
    // if (this.isOwner(data, client)) {
    //   await this.deleteDocumentByUuid(uuid);
    //   return server.to(uuid).emit('user-list', {});
    // }

    // 유저리스트에서 클라이언트 ID 제거
    delete data.userList[client.id];

    // 업데이트된 데이터를 저장
    await this.roomModel.findOneAndUpdate({ uuid }, data);

    // 클라이언트 ID에 해당하는 사용자를 찾아 삭제
    const user = await this.socketModel
      .findOneAndDelete({ clientId: client.id })
      .exec();

    if (!user) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 클라이언트 ID를 찾을 수 없습니다.');
    }

    server.to(uuid).emit('leave-user', user?.nickname);

    // 유저리스트 보내주기
    //this.emitEventForUserList(client, server, uuid);
  }

  isOwner(findRoom: any, client: Socket): boolean {
    const findOwnerNickname = findRoom['userList'][findRoom.owner]?.nickname;
    const findMyNickname = findRoom['userList'][client.id]?.nickname;
    return findOwnerNickname === findMyNickname;
  }

  /**
   * 소켓으로 유저 리스트 이벤트를 해당 방에 접속중인 클라이언트에게 보냅니다.
   * @param server 보낼 주체(서버)
   * @param uuid 이벤트를 보낼 대상이 접속중인 방의 고유 uuid
   */
  emitEventForUserList(client: Socket, server: Server, uuid: string) {
    const data = this.roomModel.findOne({ uuid });
    if (!data) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }
    server.to(uuid).emit('user-list', data['userList']);
  }

  async deleteDocumentByUuid(uuid: string): Promise<any> {
    try {
      // Find the document by UUID and delete it
      const result = await this.roomModel.findOneAndDelete({ uuid }).exec();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async disconnectClient(client: Socket, server: Server) {
    // 클라이언트 ID를 기반으로 사용자 정보 조회
    const user = await this.socketModel.findOne({ clientId: client.id });
    if (!user) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 클라이언트 ID를 찾을 수 없습니다.');
    }

    const uuid = user.uuid;
    const nickname = user.nickname;

    // 클라이언트 ID에 해당하는 사용자를 삭제
    await this.socketModel.findOneAndDelete({ clientId: client.id }).exec();

    // 방 정보 조회
    const data = await this.roomModel.findOne({ uuid: uuid });
    if (!data) {
      return server
        .to(client.id)
        .emit('error-room', '해당되는 방을 찾을 수 없습니다.');
    }

    // 유저리스트에서 클라이언트 ID 제거
    delete data.userList[client.id];

    // 업데이트된 데이터를 저장
    await this.roomModel.findOneAndUpdate({ uuid }, data);

    // 방에 대한 disconnect_user 이벤트 발송
    server.to(uuid).emit('disconnect_user', nickname);

    // 로깅
    this.logger.log(`disconnected: ${client.id}`);

    // await this.leaveRoomRequestToApiServer(uuid);
    // 유저리스트 보내주기
    // this.emitEventForUserList(client, server, uuid);
  }

  // async leaveRoomRequestToApiServer(uuid): Promise<void> {
  //   const headers = {
  //     'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
  //   };
  //   await axios.post(`${baseURL}/room/socket/leave/${uuid}`, undefined, {
  //     headers,
  //   });
  // }

  // async deleteRoomRequestToApiServer(uuid): Promise<void> {
  //   const headers = {
  //     'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
  //   };
  //   await axios.delete(`${baseURL}/room/socket/${uuid}`, { headers });
  // }
}
