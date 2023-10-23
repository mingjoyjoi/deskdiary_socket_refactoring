import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [AuthModule, PrismaModule, UserModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
