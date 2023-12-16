import { pubClient as Redis } from '../redis.adapter';
import { Injectable, Logger } from '@nestjs/common';
import { IRoomRequest, UserData } from './room-chats.interface';

@Injectable()
export class RoomchatsRepository {
  private logger: Logger = new Logger('RoomchatsRepository');

  async getUserInfo(userId: number): Promise<string | null> {
    try {
      return await Redis.get(`user:${userId}`);
    } catch (error) {
      this.logger.error(`Failed to get user info for userId ${userId}`, error.stack);
      throw error;
    }
  }

  async getClientInfo(clientId: string): Promise<string | null> {
    try {
      return await Redis.get(`client:${clientId}`);
    } catch (error) {
      this.logger.error(`Failed to get client info for clientId ${clientId}`, error.stack);
      throw error;
    }
  }

  async getRoomInfo(uuid: string): Promise<string | null> {
    try {
      return await Redis.get(`room:${uuid}`);
    } catch (error) {
      this.logger.error(`Failed to get room info for uuid ${uuid}`, error.stack);
      throw error;
    }
  }

  async setRoomUserAndClient(
    { uuid, userId }: IRoomRequest,
    clientId: string,
    roomData,
    userData: UserData,
  ): Promise<void> {
    const multi = Redis.multi();

    try {
      multi.set(`room:${uuid}`, JSON.stringify(roomData))
        .set(`user:${userId}`, JSON.stringify(userData))
        .set(`client:${clientId}`, uuid);

      await multi.exec();
    } catch (error) {
      this.logger.error(`Failed to set room, user, and client data for uuid ${uuid}`, error.stack);
      throw error;
    }
  }

  async deleteRoom(uuid: string): Promise<void> {
    try {
      await Redis.del(`room:${uuid}`);
    } catch (error) {
      this.logger.error(`Failed to delete room for uuid ${uuid}`, error.stack);
      throw error;
    }
  }

  async deleteUserAndClient(userId: number, clientId: string): Promise<void> {
    const multi = Redis.multi();

    try {
      multi.del(`user:${userId}`).del(`client:${clientId}`);
      await multi.exec();
    } catch (error) {
      this.logger.error(`Failed to delete user and client data for userId ${userId}`, error.stack);
      throw error;
    }
  }

  async setRoomDeleteUserAndClient(
    room, 
    uuid: string,
    userId: number,
    clientId: string,
  ): Promise<void> {
    const multi = Redis.multi();

    try {
      multi.set(`room:${uuid}`, JSON.stringify(room))
        .del(`user:${userId}`)
        .del(`client:${clientId}`);

      await multi.exec();
    } catch (error) {
      this.logger.error(`Failed to set room and delete user and client data for uuid ${uuid}`, error.stack);
      throw error;
    }
  }

  async deleteRoomUserAndClient(
    uuid: string,
    userId: number,
    clientId: string,
  ): Promise<void> {
    const multi = Redis.multi();

    try {
      multi.del(`room:${uuid}`)
        .del(`user:${userId}`)
        .del(`client:${clientId}`);

      await multi.exec();
    } catch (error) {
      this.logger.error(`Failed to delete room, user, and client data for uuid ${uuid}`, error.stack);
      throw error;
    }
  }
}