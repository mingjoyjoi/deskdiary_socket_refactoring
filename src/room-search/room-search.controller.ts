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
    return await this.roomSearchService.PopularStudyRooms();
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
    return await this.roomSearchService.PopularHobbyRooms();
  }

  @Get('/rooms/popular')
  @ApiOperation({
    summary: '전체방 인기순 조회',
  })
  async getPopularRooms() {
    return await this.roomSearchService.PopularRooms();
  }

  @Get('/rooms/latest')
  @ApiOperation({
    summary: '전체방 최신순 조회',
  })
  async getLatestRooms() {
    return await this.roomSearchService.LatestRooms();
  }

  @Get('study-rooms/popular-top')
  @ApiOperation({
    summary: '스터디룸 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸을 조회수 기준 인기순 Top10으로 조회 합니다.',
  })
  async getPopularStudyRoomsTop10() {
    return await this.roomSearchService.PopularStudyRoomsTop10();
  }

  @Get('hobby-rooms/popular-top')
  @ApiOperation({
    summary: '취미룸 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸을 조회수 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getPopularHobbyRoomsTop10() {
    return await this.roomSearchService.PopularHobbyRoomsTop10();
  }

  @Get('/rooms/popular-top')
  @ApiOperation({
    summary: '전체방 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '전체방을 조회수 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getPopularRoomsTop10() {
    return await this.roomSearchService.PopularRoomsTop10();
  }

  @Get('/rooms/latest-top')
  @ApiOperation({
    summary: '전체방 최신순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '전체방을 최신순 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getLatestRoomsTop10() {
    return await this.roomSearchService.LatestRoomsTop10();
  }
}
