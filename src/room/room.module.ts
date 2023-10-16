import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
