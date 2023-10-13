// import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request, Response } from 'express';
// import { UserService } from '../user/user.service';

// interface IOAuthUser {
//   user: {
//     names: string;
//     email: string;
//   };
// }
// @Controller()
// export class AuthController {
//   constructor(private readonly userService: UserService) {}

//   @UseGuards(AuthGuard('google'))
//   @Get('/login/google')
//   async logintGoogle(@Req() req: Request & IOAuthUser, @Res() res: Response) {
//     //1. 회원조회
//     const user = await this.userService.findOne({ email: req.user.email });

//     if (!user)
//       this.userService.createuser({
//         name: req.user.name,
//         email: req.user.email,
//         hashedPassword: req.user.hashedPassword,
//         age: req.user.age,
//       });
//     // 3. 로그인
//     this.authService.setRefreshToken({ user, res });
//     res.redirect('/마이페이지');
//   }
// }
