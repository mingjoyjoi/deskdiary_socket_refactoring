import { Injectable } from '@nestjs/common';
import { NewRoom } from './room.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class RoomRepository {
  constructor(private prisma: PrismaService) {}

  async createRoom(newRoom: NewRoom) {
    return await this.prisma.room.create({
      data: newRoom,
    });
  }

  async deleteRoom(uuid: string) {
    return await this.prisma.room.delete({
      where: { uuid: uuid },
    });
  }

  async findManyRoom() {
    return await this.prisma.room.findMany({
      select: {
        uuid: true,
        title: true,
        category: true,
        agoraAppId: true,
        agoraToken: true,
        ownerId: true,
      },
    });
  }
  async findRoomByUuid(uuid: string) {
    return await this.prisma.room.findUnique({
      where: { uuid: uuid },
    });
  }

  async updateRoomByJoin(uuid: string) {
    return await this.prisma.room.update({
      data: {
        nowHeadcount: {
          increment: 1, // 증가시키려는 값
        },
        count: {
          increment: 1,
        },
      },
      where: { uuid: uuid },
    });
  }

  async updateRoomByLeave(uuid: string) {
    return await this.prisma.room.update({
      data: {
        nowHeadcount: {
          decrement: 1, // 감소시키려는 값
        },
      },
      where: { uuid: uuid },
    });
  }

  async createHistory(newHistory: CreateHistoryDto) {
    return await this.prisma.history.create({
      data: newHistory,
    });
  }

  async updateRoomByRefreshToken(aFreshToken: string, uuid: string) {
    return await this.prisma.room.update({
      data: {
        agoraToken: aFreshToken,
      },
      where: { uuid: uuid },
    });
  }
}
