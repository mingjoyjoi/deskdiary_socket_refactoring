import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
// import { UserDetailService } from './user-detail.service';
import { SetGoalTimeDto } from './dto/set.goaltime.dto';
import { UpdateGoalTimeDto } from './dto/update.goaltime.dto';
import { SetMainCategoryDto } from './dto/set.maincategory.dto';
import { UpdateMainCategoryDto } from './dto/update.maincategory.dto';
import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
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
    summary: '목표 시간 설정',
    description: '목표 시간을 설정합니다.',
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
    description: '목표 시간을 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getGoalTime(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.userDetailService.getGoalTimeById(userId);
  }

  // 목표 시간 수정
  // @Put('goaltime')
  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '목표 시간 수정',
  //   description: '목표 시간을 수정합니다.',
  // })
  // @UseGuards(JwtAuthGuard)
  // async updateStudyGoalTime(
  //   @Req() req: Request,
  //   @Body() updateGoalTimeDto: UpdateGoalTimeDto,
  // ) {
  //   const userId = req.user['userId'];
  //   return this.userDetailService.updateGoalTime(updateGoalTimeDto, userId);
  // }

  // 메인 카테고리 설정 및 수정
  @Post('category')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '카테고리 설정',
    description: '카테고리를 설정합니다.',
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
    summary: '카테고리 조회',
    description: '카테고리를 조회합니다.',
  })
  @UseGuards(JwtAuthGuard)
  async getMainCategory(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.userDetailService.getMainCategory(userId);
  }
}