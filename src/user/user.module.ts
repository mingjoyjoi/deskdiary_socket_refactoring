import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserJoinController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [UserJoinController],
  providers: [UserService],
})
export class UserModule {}
