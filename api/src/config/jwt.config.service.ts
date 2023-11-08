import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME', '1y'), // 기본값으로 '1y' 사용
      },
    };
  }

  // 직접 signOptions을 가져오는 메서드 추가
  getJwtSignOptions() {
    return this.createJwtOptions().signOptions;
  }
}
