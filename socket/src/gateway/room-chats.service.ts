import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IRoomRequest } from './room-chats.interface';
import { Model } from 'mongoose';
import { Socket as SocketModel } from '../models/sockets.model';
import { Room as RoomModel } from '../models/rooms.model';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Exception } from '../exception/exception';
import axios from 'axios';
import { baseURL } from '../constant/url.constant';
import { pubClient as Redis } from '../redis.adapter';


@Injectable()
export class RoomchatsService {
  private logger = new Logger('RoomchatsService');

  constructor(
    @InjectModel(SocketModel.name)
    private readonly socketModel: Model<SocketModel>,
    @InjectModel(RoomModel.name) private readonly roomModel: Model<RoomModel>,
  ) {
    this.logger.log('RoomchatsService constructor');
  }

  async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    const { uuid, nickname, userId } = iRoomRequest;

    this.logger.log(`Redis.get 호출 전: user:${userId}`);
    const exist = await this.socketModel.findOne({ userId: userId });
    // const exist = await Redis.get(`user:${userId}`);
    this.logger.log(`Redis.get 호출 후: user:${userId} 결과: ${exist}`);
    if (exist) {
      await this.leaveRoomRequestToApiServer(uuid);
      return client.emit('joinError', Exception.clientAlreadyConnected);
    }
    client.leave(client.id);
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
  // async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
  //   const { uuid, nickname, userId } = iRoomRequest;
  //   this.logger.log(`Redis.get 호출 전: user:${userId}`);
  //   const exist = await Redis.get(`user:${userId}`);
  //   this.logger.log(`Redis.get 호출 후: user:${userId} 결과: ${exist}`);

  //   if (exist) {
  //     await this.leaveRoomRequestToApiServer(uuid);
  //     return client.emit('joinError', Exception.clientAlreadyConnected);
  //   }
  //   client.leave(client.id);
  //   client.join(uuid);

  //   const data = await Redis.get(`room:${uuid}`);

  //   if (!data) {
  //     await this.createRoom(client, iRoomRequest);
  //   } else {
  //     await this.updateRoom(client, data, iRoomRequest);
  //   }
  //   this.emitEventForUserList(client, server, uuid, nickname, 'new-user');
  // }

  async createRoom(
    client: Socket,
    { nickname, uuid, img, userId }: IRoomRequest,
  ) {
    const newRoom = {
      uuid: uuid,
      owner: client.id,
      ownerId: userId,
      userList: {},
    };
    newRoom.userList = { [client.id]: { nickname, img, userId } };
    await this.roomModel.create(newRoom);
    const newUser = {
      clientId: client.id,
      uuid: uuid,
      nickname: nickname,
      userId: userId,
    };
    await this.socketModel.create(newUser);
  }
  // async createRoom(
  //   client: Socket,
  //   { nickname, uuid, img, userId }: IRoomRequest,
  // ) {
  //   const roomData = {
  //     uuid: uuid,
  //     owner: userId,
  //     userList: { [client.id]: { nickname, img, userId } },
  //   };

  //   await Redis.set(`room:${uuid}`, JSON.stringify(roomData));

  //   const userData = {
  //     clientId: client.id,
  //     uuid: uuid,
  //     nickname: nickname,
  //     userId: userId,
  //   };
  //   await Redis.set(`user:${client.id}`, JSON.stringify(userData));
  // }

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
    findRoom.userList[client.id] = { nickname, img, userId };
    await this.roomModel.findOneAndUpdate(
      { uuid },
      { $set: { userList: findRoom.userList } },
    );
  }
  // async updateRoom(
  //   client: Socket,
  //   roomData: string,
  //   { uuid, nickname, img, userId }: IRoomRequest,
  // ) {
  //   const newUser = {
  //     clientId: client.id,
  //     uuid: uuid,
  //     nickname: nickname,
  //     userId: userId,
  //   };
  //   await Redis.set(`user:${client.id}`, JSON.stringify(newUser));

  //   const room = JSON.parse(roomData);
  //   room.userList[client.id] = { nickname, img, userId };
  //   await Redis.set(`room:${uuid}`, JSON.stringify(room));
  // }

  async removeRoom(
    client: Socket,
    server: Server,
    uuid: string,
    userId: number,
  ) {
    const data = this.roomModel.findOne({ uuid });
    if (!data) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    if (this.isOwner(data, userId)) {
      await this.deleteDocumentByUuid(uuid);
      await this.socketModel.deleteMany({ uuid });
      return server.to(uuid).emit('remove-users', {}); //어떻게 넘겨줄지 서현님이랑 맞추기필요
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
  // async leaveRoom(client: Socket, server: Server, uuid: string) {
  //   const roomData = await Redis.get(`room:${uuid}`);
  //   if (!roomData) {
  //     return server.to(client.id).emit('error-room', Exception.roomNotFound);
  //   }

  //   const room = JSON.parse(roomData);
  //   const userId = room.userList[client.id];
  //   const nickname = room.userList[client.id]?.nickname;
  //   if (userId) {
  //     delete room.userList[client.id];
  //   } else {
  //     return server.to(client.id).emit('error-room', Exception.clientNotFound);
  //   }

  //   await Redis.set(`room:${uuid}`, JSON.stringify(room));

  //   // 사용자 데이터 삭제
  //   await Redis.del(`user:${client.id}`);

  //   // 유저리스트 보내주기
  //   this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
  // }

  async logOut(client: Socket, server: Server, userId: number) {
    const exist = await this.socketModel.findOne({ userId: userId });
    if (exist) {
      const uuid = exist.uuid;
      //const clientId = exist.clientId;
      await this.leaveRoomRequestToApiServer(uuid);
      return server.to(uuid).emit('log-out', { logoutUser: userId });
    }
  }
  async KickRoomByWithdrawal(client: Socket, server: Server, userId: number) {
    const room = await this.roomModel.find({ ownerId: userId });
    if (!room.length) {
      this.logger.log(`만든방없음`);
      return;
    }
    this.logger.log(`룸데이터 ${room}`);
    const roomsArr = room.map((x) => x.uuid);
    this.logger.log(`룸데이터배열 ${roomsArr}`);
    //owner가 userId인 모든방 삭제시키기
    const remove = await this.roomModel.deleteMany({ ownerId: userId });
    if (!remove) {
      this.logger.log('룸데이터 삭제 실패함');
    }
    this.logger.log('룸데이터 삭제함');
    //roomsArr가 uuid인 모든 소켓 삭제시키기
    const socketDel = await this.socketModel.deleteMany({
      $or: roomsArr.map((uuid) => ({ uuid: uuid })),
    });
    if (!socketDel) {
      this.logger.log('소켓들 삭제실패함');
    }
    this.logger.log('소켓데이터 삭제함');
    return server.to(roomsArr).emit('kick-room', Exception.roomRemoved);
  }

  isOwner(findRoom: any, userId: number): boolean {
    const findOwnerId = findRoom['ownerId'];
    return userId === findOwnerId;
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
  // async emitEventForUserList(
  //   client: Socket,
  //   server: Server,
  //   uuid: string,
  //   nickname: string,
  //   userEvent: string,
  // ) {
  //   const roomData = await Redis.get(`room:${uuid}`);
  //   if (!roomData) {
  //     return server.to(client.id).emit('error-room', Exception.roomNotFound);
  //   }

  //   const room = JSON.parse(roomData);
  //   const userListObj = room['userList'];
  //   const userListArr = Object.values(userListObj);

  //   server.to(uuid).emit(userEvent, { nickname, userListArr });
  // }

  async deleteDocumentByUuid(uuid: string): Promise<any> {
    const result = await this.roomModel.findOneAndDelete({ uuid }).exec();
    return result;
  }

  async leaveRoomRequestToApiServer(uuid: string): Promise<void> {
    const headers = {
      'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
    };

    try {
      const response = await axios.post(
        `${baseURL}/room/socket/leave/${uuid}`,
        undefined,
        {
          headers,
        },
      );
      // 성공한 경우의 처리
      console.log('요청 성공:', response.data);
    } catch (error) {
      if (error.response) {
        // 서버 응답이 있는 경우 (HTTP 상태 코드가 2xx가 아닌 경우)
        console.error('HTTP 에러 상태 코드:', error.response.status);
        console.error('HTTP 에러 응답 데이터:', error.response.data);
      } else if (error.request) {
        // 요청은 완료되었지만 서버 응답이 없는 경우
        console.error('요청에 응답이 없습니다.');
      } else {
        // 요청을 보내기 전에 발생한 에러
        console.error('요청을 보내는 중에 에러 발생:', error.message);
      }
    }
  }
}
