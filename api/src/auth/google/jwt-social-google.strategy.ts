import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(
  GoogleStrategy,
  'google',
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Google Callback URL
      scope: ['email', 'profile'],
    });
  }

  //   async validate(
  //     accessToken: string,
  //     refreshToken: string,
  //     profile: any,
  //     done: (error: string | null, user?: any) => void,
  //   ) {
  //     const { id, displayName, _json } = profile;
  //     // const email = _json.email;
  //     const googleAccount = _json.google_account;

  //     const user = {
  //       email: googleAccount.email,
  //       profile: displayName,
  //       snsId: String(profile.id),
  //       googleId: id,
  //     };
  //     done(null, user);

  async validate(accessToken: string, refreshToken: string, profile) {
    console.log(accessToken, refreshToken, profile);

    const randomNickname = await this.authService.generateUniqueNickname();
    return {
      email: profile.emails[0].value,
      password: '12093812093',
      nickname: randomNickname,
      snsId: String(profile.id),
    };
  }
}
