import { Injectable, Logger } from '@nestjs/common';
import { NewRoom } from './room.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { createTokenWithChannel } from '../utils/create-agoraToken';

@Injectable()
export class RoomRepository {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger();

  //만든지 7일 지난 방 삭제
  async deleteOldData(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // lte = less than or equal to
    await this.prisma.room.deleteMany({
      where: {
        createdAt: {
          lte: sevenDaysAgo,
        },
        nowHeadcount: 0,
      },
    });
  }

  //createAt 만든지 1시간 이상인 방을 찾음 토큰 재발급할 대상을 찾음(유효시간 23시간이하로 남음)
  async updateToken() {
    const oneHoursAgo = new Date();
    oneHoursAgo.setHours(oneHoursAgo.getHours() - 1);

    const rooms = await this.prisma.room.findMany({
      where: {
        createdAt: {
          lte: oneHoursAgo,
        },
      },
      select: {
        uuid: true,
      },
    });
    if (!rooms) return;
    const roomsArr = rooms.map((room) => room.uuid);
    const agoraAppId: string = process.env.AGORA_APP_ID ?? '';

    roomsArr.forEach(async (uuid) => {
      //토큰을 uuid에 맞게 재생성함
      const aFreshToken = createTokenWithChannel(agoraAppId, uuid);
      //갈아끼워줌
      await this.prisma.room.update({
        where: {
          uuid: uuid,
        },
        data: {
          agoraToken: aFreshToken,
        },
      });
    });
  }

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
