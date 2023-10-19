import { Module } from '@nestjs/common';
import { RoomSearchController } from './room-search.controller';
import { RoomSearchService } from './room-search.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule],
  controllers: [RoomSearchController],
  providers: [RoomSearchService],
})
export class RoomSearchModule {}
