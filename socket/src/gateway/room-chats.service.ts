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
    const exist = await Redis.get(`user:${userId}`);
    this.logger.log(`Redis.get 호출 후: user:${userId} 결과: ${exist}`);
    if (exist) {
      await this.leaveRoomRequestToApiServer(uuid);
      return client.emit('joinError', Exception.clientAlreadyConnected);
    }
    client.leave(client.id);
    client.join(uuid);
    const data = await Redis.get(`room:${uuid}`);
    if (!data) {
      await this.createRoom(client, iRoomRequest);
    } else {
      await this.updateRoom(client, JSON.parse(data), iRoomRequest);
    }
    //return server.to(uuid).emit('new-user', nickname);
    this.emitEventForUserList(client, server, uuid, nickname, 'new-user');
  }

  async createRoom(
    client: Socket,
    { nickname, uuid, img, userId }: IRoomRequest,
  ) {
    const newRoom = {
      uuid: uuid,
      owner: userId,
      userList: {
        [client.id]: { nickname, img, userId },
      },
    };
    const newUser = {
      clientId: client.id,
      uuid: uuid,
      nickname: nickname,
      userId: userId,
    };

    const multi = Redis.multi();
    multi.set(`room:${uuid}`, JSON.stringify(newRoom));
    multi.set(`user:${client.id}`, JSON.stringify(newUser));

    const execResult = await multi.exec();
    if (!execResult) {
      throw new Error('트랜잭션 실패');
    }
  }

  async updateRoom(
    client: Socket,
    roomData: string,
    { uuid, nickname, img, userId }: IRoomRequest,
  ) {
    //! 키변경 감시
    const roomKey = `room:${uuid}`;
    await Redis.watch(roomKey);

    const findRoom = roomData ? JSON.parse(roomData) : { userList: {} };
    findRoom.userList[client.id] = { nickname, img, userId };

    const multi = Redis.multi()
      .set(roomKey, JSON.stringify(findRoom)) // 방 정보 업데이트
      .set(`user:${client.id}`, uuid); // 유저가 속한 방 ID 저장

    const execResult = await multi.exec();
    if (!execResult) {
      throw new Error('트랜잭션 실패');
    }
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
    const roomData = await Redis.get(`room:${uuid}`);
    if (!roomData) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const room = JSON.parse(roomData);

    // 방에서 사용자를 찾아냅니다.
    const userId = room.userList[client.id];
    const nickname = userId?.nickname;
    if (userId) {
      delete room.userList[client.id];
    } else {
      return server.to(client.id).emit('error-room', Exception.clientNotFound);
    }
    // 방 업데이트
    await Redis.set(`room:${uuid}`, JSON.stringify(room));
    // 사용자 데이터 삭제
    await Redis.del(`socket:${client.id}`);

    //return server.to(uuid).emit('left-user', nickname);
    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
  }

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
    const room = await this.roomModel.find({ userId });
    const roomsArr = room.map((x) => x.uuid);
    //owner가 userId인 모든방 삭제시키기
    await this.roomModel.deleteMany({ owner: userId });
    //roomsArr가 uuid인 모든 소켓 삭제시키기
    await this.socketModel.deleteMany({
      $or: roomsArr.map((uuid) => ({ uuid: uuid })),
    });
    return server.to(roomsArr).emit('kick-room', Exception.roomRemoved);
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

  // async emitEventForUserList(
  //   client: Socket,
  //   server: Server,
  //   uuid: string,
  //   nickname: string,
  //   userEvent: string,
  // ) {
  //   const data = await this.roomModel.findOne({ uuid });
  //   if (!data) {
  //     return server.to(client.id).emit('error-room', Exception.roomNotFound);
  //   }
  //   const userListObj = data['userList'];
  //   const userListArr = Object.values(userListObj);

  //   server.to(uuid).emit(userEvent, { nickname, userListArr });
  // }
  async emitEventForUserList(
    client: Socket,
    server: Server,
    uuid: string,
    nickname: string,
    userEvent: string,
  ) {
    const data = await Redis.get(`room:${uuid}`);
    if (!data) {
      return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const findRoom = JSON.parse(data);
    const userListArr = Object.values(findRoom.userList);

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
