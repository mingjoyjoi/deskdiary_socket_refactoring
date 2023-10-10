import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Google Callback URL
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile) {
    console.log(accessToken, refreshToken, profile);

    return {
      name: '철수',
      email: '...',
      picture: '...',
    };
  }
}
