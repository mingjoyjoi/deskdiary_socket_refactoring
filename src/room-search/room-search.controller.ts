import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { RoomSearchService } from './room-search.service';

@ApiTags('Room 조회 API')
@Controller()
export class RoomSearchController {
  constructor(private readonly roomSearchService: RoomSearchService) {}

  @Get('study-rooms/popular')
  @ApiOperation({
    summary: '스터디룸 인기순 조회',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸을 조회수 기준 인기순으로 조회 합니다.',
  })
  async getPopularHobbyRooms() {
    return { result: await this.roomSearchService.PopularHobbyRooms() };
  }

  @Get('hobby-rooms/popular')
  @ApiOperation({
    summary: '취미룸 인기순 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸을 조회수 기준 인기순으로 조회 합니다.',
  })
  async getPopularStudyRooms() {
    return { result: await this.roomSearchService.PopularStudyRooms() };
  }

  //   @Get('/rooms/popular')
  //   @ApiOperation({
  //     summary: '방 인기순 조회',
  //   })

  //   @Get('/rooms/latest')
  //   @ApiOperation({
  //     summary: '방 최신순 조회',
  //   })

  //   @Get('user/rooms/history')
  //   @ApiOperation({
  //     summary: '유저가 최근 참여한 방 목록 조회 ',
  //   })
}
