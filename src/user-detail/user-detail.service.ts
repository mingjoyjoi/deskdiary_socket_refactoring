import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetGoalTimeDto } from './dto/set.goaltime.dto';
import { UpdateGoalTimeDto } from './dto/update.goaltime.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async setGoalTime(dto: SetGoalTimeDto, userId: number) {
    const studyGoalTime = SetGoalTimeDto;
    const user = await this.userService.findUserByUserId(userId);
    return await this.prisma.userDetail.create({
      data: {
        studyGoalTime: dto.studyGoalTime,
        hobbyGoalTime: dto.hobbyGoalTime,
        mainCategory: String(dto.mainCategory),
        UserId: userId, // 여기에 사용자 ID를 할당합니다.
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getStudyGoalTimeById(id: number) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: id },
      select: {
        UserId: true,
        studyGoalTime: true,
        hobbyGoalTime: true,
        mainCategory: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return userDetail;
  }

  async updateGoalTime(dto: UpdateGoalTimeDto, userId: number) {
    const updateData: any = {};

    // 선택적으로 studyGoalTime 및 hobbyGoalTime을 업데이트합니다.
    if (dto.studyGoalTime !== undefined) {
      updateData.studyGoalTime = dto.studyGoalTime;
    }

    if (dto.hobbyGoalTime !== undefined) {
      updateData.hobbyGoalTime = dto.hobbyGoalTime;
    }

    return await this.prisma.userDetail.update({
      where: { UserId: userId },
      data: updateData,
    });
  }

  async getHobbyGoalTimeById(id: number) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: id },
      select: {
        UserId: true,
        hobbyGoalTime: true,
        studyGoalTime: false,
        mainCategory: true,
      },
    });
    return userDetail;
  }

  async setCategory(dto: SetGoalTimeDto, userId: number) {
    const mainCategory = SetGoalTimeDto;
    const user = await this.userService.findUserByUserId(userId);

    return await this.prisma.userDetail.create({
      data: {
        UserId: userId,
        studyGoalTime: dto.studyGoalTime,
        hobbyGoalTime: dto.hobbyGoalTime,
        mainCategory: String(dto.mainCategory),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
