import { Module } from '@nestjs/common';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomRepository } from './room.repository';
// import { RoomSeedService } from './room.seed.service';

@Module({
  imports: [AuthModule, PrismaModule, UserModule, ImageModule],
  controllers: [RoomController],
  providers: [
    RoomService,
    RoomRepository,
    // RoomSeedService
  ],
})
export class RoomModule {}
