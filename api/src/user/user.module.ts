import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/auth/email/email.service';
import { JwtConfigService } from '../config/jwt.config.service';
import { ImageModule } from '../image/image.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    ImageModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtConfigService, EmailService],
  exports: [UserService],
})
export class UserModule {}
