//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

//* JWT 토큰을 이용한 전략 구현
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { userId: number; type: string }) {
    console.log('JWT Validate Payload:', payload);
    let user;
    if (payload.type === 'user' || payload.type === 'admin') {
      user = await this.userService.findOne(payload.userId);
    }
    if (!user || (payload.type !== 'user' && payload.type !== 'admin')) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
