import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomSearchService {
  constructor(private prisma: PrismaService) {}

  async PopularHobbyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'study' },
      orderBy: {
        count: 'desc',
      },
    });
  }

  async PopularStudyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'hobby' },
      orderBy: {
        count: 'desc',
      },
    });
  }

  async PopularRooms() {
    return this.prisma.room.findMany({
      orderBy: {
        count: 'desc',
      },
    });
  }
  async LatestRooms() {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async UserHistoryRooms(userId: number) {
    return this.prisma.room.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
