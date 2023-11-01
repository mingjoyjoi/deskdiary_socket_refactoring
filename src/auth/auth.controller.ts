import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('kakao'))
  @Get('/kakao-callback')
  async kakaoCallback(@Req() req, @Res() res) {
    try {
      const kakaoUser = req.user;
      // 사용자 정보를 데이터베이스에 저장하거나 업데이트합니다.
      const savedKakaoUser =
        await this.userService.findOrCreateKakaoUser(kakaoUser);

      // JWT 토큰 발급
      const jwtToken = this.jwtService.sign({
        userId: savedKakaoUser.userId, // 저장된 사용자의 ID를 사용합니다.
        email: savedKakaoUser.email,
        type: 'user',
      });
      {
        // res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'strict' });
        res.redirect(
          `https://deskdiary-fe-brown.vercel.app/auth?accessToken=${encodeURIComponent(
            jwtToken,
          )}`,
        );
      }
      console.log(res.cookie);
    } catch (error) {
      res.status(400).send(error.message || '로그인에 실패하였습니다.');
    }
  }

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('google'))
  @Get('/google-callback')
  async googleCallback(@Req() req, @Res() res) {
    const googleUser = req.user;
    const savedGoogleUser =
      await this.userService.findOrCreateGoogleUser(googleUser);

    const jwtToken = this.jwtService.sign({
      userId: savedGoogleUser.userId, // 저장된 사용자의 ID를 사용합니다.
      email: savedGoogleUser.email,
      type: 'user',
    });

    {
      // res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'strict' });
      res.redirect(
        `https://deskdiary-fe-brown.vercel.app/auth?accessToken=${encodeURIComponent(
          jwtToken,
        )}`,
      );
    }
  }
}
