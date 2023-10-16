import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KaKaoStrategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(KaKaoStrategy, 'kakao') {
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
    done: Function,
  ) {
    const { id, displayName, _json } = profile;
    const kakaoAccount = _json.kakao_account;

    const user = {
      email: kakaoAccount.email,
      nickname: displayName,
      snsId: String(profile.id),
      kakaoId: id,
    };

    done(null, user);
  }
}
