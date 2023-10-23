import { Injectable } from '@nestjs/common';
import { UserException } from '../exception/user.exception';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

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
  //1일 =학습 누적시간, 목표시간
  async getTodayLearningHistory(userId: number) {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();
    const goaltimeData = await this.prisma.userDetail.findUnique({
      where: { UserId: userId },
      select: {
        goalTime: true,
      },
    });
    if (!goaltimeData) return { message: '등록된 목표시간이 없습니다.' };

    const todayHobby = await this.prisma.$queryRaw`
    SELECT SUM(totalHous) as totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut 
    FROM History 
    Where UserId = ${userId} 
    AND historyType ='hobby'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -1 DAY)
    GROUP BY checkOut`;

    const todayStudy = await this.prisma.$queryRaw`
    SELECT SUM(totalHous) as totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut
    FROM History 
    Where UserId = ${userId} 
    AND historyType ='study'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -1 DAY)
    GROUP BY checkOut`;

    const todayHistory = {
      goaltime: goaltimeData.goalTime,
      studyTotalHours: todayHobby[0].totalHours,
      hobbyTotalHours: todayStudy[0].totalHours,
    };
    return todayHistory;
  }

  async getWeeklyLearningHistory(userId: number) {
    //7일 = 최근 7일의 학습누적시간, 날짜
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();

    const weeklyHobbyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut
    FROM History
    WHERE historyType = 'hobby'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -7 DAY) 
    AND UserId = ${userId}
    GROUP BY checkOut`;

    const weeklyStudyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut
    FROM History
    WHERE historyType = 'study'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -7 DAY) 
    AND UserId = ${userId}
    GROUP BY checkOut`;

    return { weeklyHobby: weeklyHobbyHistory, weeklyStudy: weeklyStudyHistory };
  }

  async getMonthlyLearningHistory(userId: number) {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();

    const monthlyHobbyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut
    FROM History
    WHERE historyType = 'hobby'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -30 DAY)
    AND UserId = ${userId}
    GROUP BY checkOut`;

    const monthlyStudyHistory = await this.prisma.$queryRaw`
    SELECT SUM(totalHours) AS totalHours, historyType, DATE_FORMAT(checkOut, '%Y-%m-%d') as checkOut
    FROM History
    WHERE historyType = 'study'
    AND checkOut >= DATE_ADD(NOW(), INTERVAL -30 DAY)
    AND UserId = ${userId}
    GROUP BY checkOut`;

    return {
      monthlyHobby: monthlyHobbyHistory,
      monthlyStudy: monthlyStudyHistory,
    };
  }
}
