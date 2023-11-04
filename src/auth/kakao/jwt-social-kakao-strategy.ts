import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KaKaoStrategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(KaKaoStrategy, 'kakao') {
  authService: any;
  constructor() {
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
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
