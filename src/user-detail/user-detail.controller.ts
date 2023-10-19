import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { SetGoalTimeDto } from './dto/set.goaltime.dto';
import { UpdateGoalTimeDto } from './dto/update.goaltime.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('User-detail API')
@Controller('me/history')
export class UserDetailController {
  constructor(private readonly userDetailService: UserDetailService) {}

  // 학습 목표 시간 설정-조회-수정
  @Post('setGoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '목표 시간 설정 & 메인 카테고리 설정',
    description:
      '학습&취미 목표 시간을 설정합니다.메인 카테고리를 설정합니다. 자정이 지나면 소멸되는 로직은 어떨까요?',
  })
  @UseGuards(JwtAuthGuard)
  async setGoalTime(
    @Req() req: Request,
    @Body() setGoalTimeDto: SetGoalTimeDto,
  ) {
    const userId = req.user['userId'];
    const userDetailId = req.user['userDetailId'];
    return this.userDetailService.setGoalTime(setGoalTimeDto, userId);
  }

  @Get('get-GoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '학습 목표 시간 조회',
    description: '설정한 학습 목표 시간을 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getGoalTimeById(@Req() req: any) {
    const userId = req.user['userId'];
    return this.userDetailService.getStudyGoalTimeById(userId);
  }

  @Put('update-studyGoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '학습 목표 시간 수정',
    description: '학습 목표 시간을 수정합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async updateStudyGoalTime(
    @Req() req: Request,
    @Body() updateGoalTimeDto: UpdateGoalTimeDto,
  ) {
    const userId = req.user['userId']; // 로그인된 사용자의 ID를 가져옵니다.
    return this.userDetailService.updateGoalTime(updateGoalTimeDto, userId);
  }

  // 취미 목표 설정 - 조회 - 수정
  @Post('set-hobbyGoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '취미 목표 시간 설정',
    description:
      '취미 목표 시간을 설정합니다. 자정이 지나면 소멸되는 로직은 어떨까요?',
  })
  @UseGuards(JwtAuthGuard)
  async setHobbyGoalTime(
    @Req() req: Request,
    @Body() setGoalTimeDto: SetGoalTimeDto,
  ) {
    const userId = req.user['userId'];
    return this.userDetailService.setGoalTime(setGoalTimeDto, userId);
  }

  @Get('get-hobbyGoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '취미 목표 시간 조회',
    description: '취미 목표 시간을 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getHobbyGoalTimeById(@Req() req: any) {
    const userId = req.user['userId'];
    return this.userDetailService.getHobbyGoalTimeById(userId);
  }

  @Put('update-studyGoalTime')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '취미 목표 시간 수정',
    description: '취미 목표 시간을 수정합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async hobbyStudyGoalTime(
    @Req() req: Request,
    @Body() updateGoalTimeDto: UpdateGoalTimeDto,
  ) {
    const userId = req.user['userId']; // 로그인된 사용자의 ID를 가져옵니다.
    return this.userDetailService.updateGoalTime(updateGoalTimeDto, userId);
  }

  // 대표 카테고리 설정
  @Post('category')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '메인 카테고리 설정',
    description: '유저가 자신의 메인 카테고리가 학습인지 취미인지 설정합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async setCategory(
    @Req() req: Request,
    @Body() setGoalTimeDto: SetGoalTimeDto,
  ) {
    const userId = req.user['userId'];
    return this.userDetailService.setCategory(setGoalTimeDto, userId);
  }

  // @Get('category')
  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '메인 카테고리 조회',
  //   description: '유저가 자신이 설정한 카테고리를 조회합니다.',
  // })
  // @UseGuards(JwtAuthGuard)
  // async getCategoryById(@Req() req: any) {
  //   const userId = req.user['userId'];
  //   return this.userDetailService.getCategoryById(userId);
  // }

  // @Put('category')
  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '메인 카테고리 수정',
  //   description: '유저가 자신이 설정한 카테고리를 수정합니다.',
  // })
  // @UseGuards(JwtAuthGuard)
  // async updateCategory(
  //   @Req() req: Request,
  //   @Body() updateGoalTimeDto: UpdateGoalTimeDto,
  // ) {
  //   const userId = req.user['userId']; // 로그인된 사용자의 ID를 가져옵니다.
  //   return this.userDetailService.updateCategory(updateGoalTimeDto, userId);
  // }
}
