import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtConfigService } from '../config/jwt.config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt/auth.jwt.strategy';
import { UserService } from '../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { JwtKakaoStrategy } from './kakao/jwt-social-kakao-strategy';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    UserModule,
    HttpModule,
    ImageModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtConfigService, UserService, JwtKakaoStrategy], //JwtKakaoStrategy
  exports: [JwtStrategy, JwtConfigService],
})
export class AuthModule {}
