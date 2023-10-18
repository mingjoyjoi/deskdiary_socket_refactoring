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
}
