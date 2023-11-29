import { pubClient as Redis } from '../redis.adapter';
import { Injectable, Logger } from '@nestjs/common';
import {
  IRoomRequest,
  RoomData,
  UserData,
  UuidData,
} from './room-chats.interface';

@Injectable()
export class RoomchatsRepository {
  private logger: Logger = new Logger('RoomchatsRepository');

  async getUserIdInfo(userId: number) {
    //특정 종류의 데이터를 구분하기 위해 네임스페이스를 사용한다는데 사용법공부필요
    return await Redis.get(`userId:${userId}`);
  }

  async getUserInfo(clinetId: string) {
    return Redis.get(`user:${clinetId}`);
  }

  async getRoomInfo(uuid: string) {
    return await Redis.get(`room:${uuid}`);
  }

  async setRoomAndUserData(
    { uuid, userId }: IRoomRequest,
    clientId: string,
    roomData: RoomData,
    uuidData: UuidData,
    userData: UserData,
  ) {
    await Redis.set(`room:${uuid}`, JSON.stringify(roomData));
    await Redis.set(`userId:${userId}`, JSON.stringify(uuidData));
    await Redis.set(`user:${clientId}`, JSON.stringify(userData));
  }

  async deleteRoom(uuid: string) {
    await Redis.del(`room:${uuid}`);
  }

  async deleteUserAndUserId(clientId: string, userId: number) {
    await Redis.del(`user:${clientId}`);
    await Redis.del(`userId:${userId}`);
  }

  async setRoomAndDeleteUser(
    userId: number,
    uuid: string,
    room: RoomData,
    clientId: string,
  ) {
    await Redis.del(`userId:${userId}`);
    await Redis.set(`room:${uuid}`, JSON.stringify(room));
    await Redis.del(`user:${clientId}`);
  }
}
