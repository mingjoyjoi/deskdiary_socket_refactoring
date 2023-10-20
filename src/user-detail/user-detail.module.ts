import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule],
  providers: [UserDetailService],
  controllers: [UserDetailController],
})
export class UserDetailModule {}
