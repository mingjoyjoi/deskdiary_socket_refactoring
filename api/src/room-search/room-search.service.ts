import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomSearchService {
  constructor(private prisma: PrismaService) {}

  //인기순 조회
  async PopularRooms(page: number, perPage: number, category: string) {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const QueryResults = await this.prisma.room.findMany({
      where: { category },
      orderBy: [
        {
          count: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take,
      skip,
    });
    const totalCount = await this.ResultCountByCategory(category);
    const nowCount = skip + take > totalCount ? totalCount : skip + take;
    const remainingCount = totalCount - nowCount;

    return {
      QueryResults,
      nowCount,
      remainingCount,
      totalCount,
    };
  }

  async LatestRooms(page: number, perPage: number, category: string) {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const QueryResults = await this.prisma.room.findMany({
      where: { category },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          count: 'desc',
        },
      ],
      take,
      skip,
    });
    const totalCount = await this.ResultCountByCategory(category);
    const nowCount = skip + take > totalCount ? totalCount : skip + take;
    const remainingCount = totalCount - nowCount;

    return {
      QueryResults,
      nowCount,
      remainingCount,
      totalCount,
    };
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

  async OwnersRooms(userId: number) {
    const rooms = await this.prisma.room.findMany({
      where: { ownerId: userId },
    });
    return rooms;
  }

  //검색
  async searchRooms(
    filter: string,
    search: string,
    page: number,
    perPage: number,
    category: string,
  ) {
    //기본이 인기순
    const skip = (page - 1) * perPage;
    const take = perPage;
    let firstOrderBy: Record<string, 'asc' | 'desc'> = { count: 'desc' };
    let secondOrderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (filter === 'latest') {
      firstOrderBy = { createdAt: 'desc' };
      secondOrderBy = { count: 'desc' };
    }
    const QueryResults = await this.prisma.room.findMany({
      where: {
        category,
        title: {
          contains: search,
        },
      },
      orderBy: [firstOrderBy, secondOrderBy],
      take,
      skip,
    });
    const totalCount = await this.ResultCountBySearch(category, search);
    const nowCount = skip + take > totalCount ? totalCount : skip + take;
    const remainingCount = totalCount - nowCount;

    return {
      QueryResults,
      nowCount,
      remainingCount,
      totalCount,
    };
  }

  async ResultCountByCategory(category: string) {
    const count = await this.prisma.room.count({
      where: { category },
    });
    return count;
  }
  async ResultCountBySearch(category: string, search: string) {
    const count = await this.prisma.room.count({
      where: {
        category,
        title: {
          contains: search,
        },
      },
    });
    return count;
  }
}
