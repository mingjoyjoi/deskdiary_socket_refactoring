import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
// import { PrismaModule } from '../../prisma/prisma.module';
// import { AuthModule } from '../auth-basic/auth.module';

@Module({
  // imports: [AuthModule, PrismaModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
