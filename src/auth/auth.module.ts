import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtConfigService } from 'src/config/jwt.config.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt/auth.jwt.strategy';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    UserModule,
  ],
  controllers: [],
  providers: [JwtStrategy, JwtConfigService, UserService],
  exports: [JwtStrategy, JwtConfigService],
})
export class AuthModule {}
