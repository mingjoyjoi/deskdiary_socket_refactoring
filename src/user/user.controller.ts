import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { UserService } from './user.service';
import { JoinUserDto } from './dto/join.user.dto';
import { LoginUserDto } from './dto/login.user.dto';

@ApiTags('Join')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post('join')
  @HttpCode(200)
  async createUserAccount(@Body() joinuserDto: JoinUserDto) {
    return await this.userService.signUp(joinuserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(
    @Body() loginuserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.login(loginuserDto, res);
  }

  // @ApiOperation({ summary: '로그아웃' })
  // @Post('logout')
  // async logout(@Body() loginuserDto: LoginUserDto) {
  //   return await this.userService.logout(loginuserDto.email);
  // }
}
