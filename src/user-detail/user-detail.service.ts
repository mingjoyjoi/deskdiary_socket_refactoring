import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetGoalTimeDto } from './dto/set.goaltime.dto';
import { UpdateGoalTimeDto } from './dto/update.goaltime.dto';
import { SetMainCategoryDto } from './dto/set.maincategory.dto';
import { UpdateMainCategoryDto } from './dto/update.maincategory.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async setGoalTime(dto: SetGoalTimeDto, userId: number) {
    // 해당 UserId의 UserDetail을 찾습니다.
    const existingDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: userId },
    });

    if (existingDetail) {
      // 이미 존재하는 경우, goalTime을 업데이트합니다.
      return await this.prisma.userDetail.update({
        where: { UserDetailId: existingDetail.UserDetailId },
        data: {
          goalTime: dto.goalTime,
          updatedAt: new Date(),
        },
      });
    } else {
      // 존재하지 않는 경우, 새 레코드를 생성합니다.
      return await this.prisma.userDetail.create({
        data: {
          goalTime: dto.goalTime,
          UserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  async getGoalTimeById(id: number) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: id },
      select: {
        UserId: true,
        goalTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return userDetail;
  }

  // async updateGoalTime(dto: UpdateGoalTimeDto, userId: number) {
  //   const updateData: any = {};

  //   if (dto.goalTime !== undefined) {
  //     updateData.goalTime = dto.goalTime;
  //   }

  //   return await this.prisma.userDetail.update({
  //     where: { UserId: userId },
  //     data: updateData,
  //   });
  // }

  async setMainCategory(dto: SetMainCategoryDto, userId: number) {
    const existingDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: userId },
    });

    if (existingDetail) {
      // 기존 레코드 업데이트
      return await this.prisma.userDetail.update({
        where: { UserId: userId },
        data: { mainCategory: String(dto.mainCategory) },
      });
    } else {
      // 새로운 레코드 생성
      return await this.prisma.userDetail.create({
        data: {
          UserId: userId,
          mainCategory: String(dto.mainCategory),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  async getMainCategory(id: number) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { UserId: id },
      select: {
        UserId: true,
        UserDetailId: true,
        mainCategory: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return userDetail;
  }
}
