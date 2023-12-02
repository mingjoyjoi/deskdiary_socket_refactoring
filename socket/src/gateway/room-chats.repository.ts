import { pubClient as Redis } from '../redis.adapter';
import { Injectable, Logger } from '@nestjs/common';
import { IRoomRequest, UserData } from './room-chats.interface';

@Injectable()
export class RoomchatsRepository {
  private logger: Logger = new Logger('RoomchatsRepository');

  async getUserInfo(userId: number) {
    //특정 종류의 데이터를 구분하기 위해 네임스페이스를 사용한다는데 사용법공부필요
    return Redis.get(`user:${userId}`);
  }

  async getclientInfo(clinetId: string) {
    return Redis.get(`client:${clinetId}`);
  }

  async getRoomInfo(uuid: string) {
    return Redis.get(`room:${uuid}`);
  }

  async setRoomAndUserAndClient(
    { uuid, userId }: IRoomRequest,
    clientId: string,
    roomData,
    userData: UserData,
  ) {
    await Redis.set(`room:${uuid}`, JSON.stringify(roomData));
    await Redis.set(`user:${userId}`, JSON.stringify(userData));
    await Redis.set(`client:${clientId}`, uuid);
  }

  async deleteRoom(uuid: string) {
    await Redis.del(`room:${uuid}`);
  }

  async deleteUserAndClient(userId: number, clientId: string) {
    await Redis.del(`user:${userId}`);
    await Redis.del(`client:${clientId}`);
  }
  async setRoomAndDeleteUserAndClient(
    room,
    uuid: string,
    userId: number,
    clientId: string,
  ) {
    await Redis.set(`room:${uuid}`, JSON.stringify(room));
    await Redis.del(`user:${userId}`);
    await Redis.del(`client:${clientId}`);
  }

  async deleteRoomAndUserAndClient(
    room,
    uuid: string,
    userId: number,
    clientId: string,
  ) {
    await Redis.del(`room:${uuid}`);
    await Redis.del(`user:${userId}`);
    await Redis.del(`client:${clientId}`);
  }
}
