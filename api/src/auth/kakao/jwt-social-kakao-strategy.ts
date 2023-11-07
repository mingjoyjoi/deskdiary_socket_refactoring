import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KaKaoStrategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(KaKaoStrategy, 'kakao') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: string | null, user?: any) => void,
  ) {
    const { id, _json } = profile;
    const kakaoAccount = _json.kakao_account;
    const randomNickname = await this.authService.generateUniqueNickname();
    const user = {
      email: kakaoAccount.email,
      nickname: randomNickname,
      snsId: String(profile.id),
      kakaoId: id,
    };
    done(null, user);
  }
}
