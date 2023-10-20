import { Injectable } from '@nestjs/common';
import { UserException } from '../exception/user.exception';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class HistoryService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async visitedRoomListAll(userId: number) {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();

    const rooms = await this.prisma.history.findMany({
      where: { UserId: userId },
      select: { RoomId: true },
    });
    if (!rooms.length) {
      return { message: '최근 방문한 방이 없습니다.' };
    }
    //10개 만
    const roomIdArray = rooms.map((room) => room.RoomId);
    const uniqueRoomIdArray = [...new Set(roomIdArray)];

    const roomsWithHistory = await this.prisma.room.findMany({
      select: {
        roomId: true,
        uuid: true,
        agoraToken: true,
        title: true,
        note: true,
        nowHeadcount: true,
        maxHeadcount: true,
        roomThumbnail: true,
        category: true,
      },
      where: {
        roomId: {
          in: uniqueRoomIdArray,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return roomsWithHistory;
  }

  async studyRankings() {
    // checkout 7일치만으로 수정하기
    const studyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, nickname
    FROM History
    WHERE historyType = 'study' 
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -7 DAY) 
    GROUP BY UserId
    ORDER BY totalHours DESC
    LIMIT 5
  `;
    return studyHistory;
  }

  async hobbyRankings() {
    const hobbyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, nickname
    FROM History
    WHERE historyType = 'hobby'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -7 DAY) 
    GROUP BY UserId
    ORDER BY totalHours DESC
    LIMIT 5
  `;
    return hobbyHistory;
  }
}
