import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomSearchService {
  constructor(private prisma: PrismaService) {}

  async PopularHobbyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'hobby' },
      orderBy: {
        count: 'desc',
      },
    });
  }

  async PopularStudyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'study' },
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
  async LatestHobbyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'hobby' },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async LatestStudyRooms() {
    return this.prisma.room.findMany({
      where: { category: 'study' },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //? Top10
  async PopularHobbyRoomsTop10() {
    return this.prisma.room.findMany({
      where: { category: 'hobby' },
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }
  async PopularStudyRoomsTop10() {
    return this.prisma.room.findMany({
      where: { category: 'study' },
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }

  async PopularRoomsTop10() {
    return this.prisma.room.findMany({
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }
  async LatestRoomsTop10() {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }
}
