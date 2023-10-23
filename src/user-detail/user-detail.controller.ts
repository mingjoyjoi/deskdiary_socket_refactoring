import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
// import { UserDetailService } from './user-detail.service';
import { SetGoalTimeDto } from './dto/set.goaltime.dto';
import { SetMainCategoryDto } from './dto/set.maincategory.dto';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import {
  GoalTimeExample,
  GoalTimeListExample,
  MainCategoryExample,
  MainCategoryListExample,
} from './user-detail.response.examples';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';
import { UserDetailService } from './user-detail.service';

@ApiTags('me')
@Controller('me/history')
export class UserDetailController {
  constructor(private readonly userDetailService: UserDetailService) {}

  // 목표 시간 설정 및 수정
  @Post('goaltime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '목표 시간 설정 및 수정',
  })
  @ApiResponse({
    status: 200,
    description:
      '유저가 설정한 목표시간(숫자)을 데이터베이스(UserDetail 테이블)에 저장하고 수정합니다.',
    content: {
      examples: GoalTimeExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async setGoalTime(
    @Req() req: Request,
    @Body() setGoalTimeDto: SetGoalTimeDto,
  ) {
    const userId = req.user['userId'];
    return this.userDetailService.setGoalTime(setGoalTimeDto, userId);
  }

  // 목표 시간 조회
  @Get('goaltime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '목표 시간 조회',
  })
  @ApiResponse({
    status: 200,
    description: '유저가 설정한 목표시간(숫자)을 조회합니다.',
    content: {
      examples: GoalTimeListExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async getGoalTime(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.userDetailService.getGoalTimeById(userId);
  }

  // 메인 카테고리 설정 및 수정
  @Post('category')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '메인 카테고리 설정',
  })
  @ApiResponse({
    status: 200,
    description:
      '유저가 설정한 메인카테고리(취미 or 학습)을 데이터베이스(UserDetail 테이블)에 저장하고 수정합니다.',
    content: {
      examples: MainCategoryExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async setMainCategory(
    @Req() req: Request,
    @Body() setMainCategoryDto: SetMainCategoryDto,
  ) {
    const userId = req.user['userId'];
    return this.userDetailService.setMainCategory(setMainCategoryDto, userId);
  }

  // 메인 카테고리 조회
  @Get('category')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '메인 카테고리 조회',
  })
  @ApiResponse({
    status: 200,
    description: '유저가 설정한 메인카테고리(취미 or 학습)을 조회합니다.',
    content: {
      examples: MainCategoryListExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async getMainCategory(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.userDetailService.getMainCategory(userId);
  }
}
