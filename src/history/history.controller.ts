import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { HistoryService } from './history.service';
import { Request } from 'express';

@ApiTags('History API')
@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('my-rooms')
  @ApiOperation({
    summary: '해당 유저가 참여했던 방 목록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '유저가 참여했던 방 목록을 최신순으로 10개 조회합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getVisitedRoomList(@Req() req: Request) {
    const userId = req.user['userId'];
    return await this.historyService.visitedRoomListAll(userId);
  }

  @Get('study-room/rankings')
  @ApiOperation({
    summary: '스터디룸의 유저 랭킹 조회',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸 7일 누적시간 기준 상위 5명의 유저를 조회합니다.',
  })
  async getStudyRankings() {
    return await this.historyService.studyRankings();
  }

  @Get('hobby-room/rankings')
  @ApiOperation({
    summary: '취미룸의 유저 랭킹 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸 7일 누적시간 기준  상위 5명의 유저를  조회합니다.',
  })
  async getHobbyRankings() {
    return await this.historyService.hobbyRankings();
  }

  @Get('today-learning-history')
  @ApiOperation({
    summary: '1일 학습 기록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '1일 동안의 해당 유저의 학습기록 데이터를 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getTodayLearningHistory(@Req() req: Request) {
    const userId = req.user['userId'];
    return await this.historyService.getTodayLearningHistory(userId);
  }

  @Get('weekly-learning-history')
  @ApiOperation({
    summary: '7일 학습 기록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '일주일 동안의 해당 유저의 학습기록 데이터를 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getWeeklyLearningHistory(@Req() req: Request) {
    const userId = req.user['userId'];
    return await this.historyService.getWeeklyLearningHistory(userId);
  }

  @Get('monthly-learning-history')
  @ApiOperation({
    summary: '30일 학습 기록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '한달 동안의 해당 유저의 학습기록 데이터를 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getMonthlyLearningHistory(@Req() req: Request) {
    const userId = req.user['userId'];
    return await this.historyService.getMonthlyLearningHistory(userId);
  }
}
