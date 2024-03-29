import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JoinUserDto } from './dto/join.user.dto';
import { VerifyEmailDto } from './dto/verify.email.dto';
import {
  GetProfileExample,
  UpdatePasswordExample,
  UpdateProfileExample,
} from './user.response.exampes';
import { UserService } from './user.service';
// import { EmailService } from 'src/auth/email/email.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginUserDto } from './dto/login.user.dto';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { UpdateProfileDto } from './dto/update.profile.dto';

@ApiTags('User API')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post('auth/join')
  @HttpCode(200)
  async createUserAccount(@Body() joinuserDto: JoinUserDto) {
    return await this.userService.signUp(joinuserDto);
  }

  @ApiOperation({ summary: '회원가입 시 이메일 인증' })
  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto, @Res() res: Response) {
    const { signupVerifyToken } = dto;
    // return await this.userService.verifyEmail(signupVerifyToken);
    const redirectUrl = await this.userService.verifyEmail(signupVerifyToken);
    return res.redirect(redirectUrl);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그인' })
  @Post('auth/login')
  async login(
    @Body() loginuserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.login(loginuserDto, res);
  }

  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({ summary: '리프레시 토큰으로 액세스 토큰 재발급' })
  @ApiResponse({ status: 200, description: '새 액세스 토큰 발급됨' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async renewAccessToken(@Body() body, @Res() res) {
    const refreshToken = body.refreshToken;
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 제공되지 않았습니다.');
    }
    return this.userService.renewAccessToken(refreshToken, res);
  }

  @Put('me/password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 수정',
  })
  @ApiResponse({
    status: 200,
    description:
      '유저의 현재 비밀번호가 일치한 것을 확인하고 수정할 비밀번호와 확인을 통해 비밀번호를 수정합니다.',
    content: {
      examples: UpdatePasswordExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    if (!updatePasswordDto.isDifferent()) {
      throw new BadRequestException(
        '현재 비밀번호와 새로운 비밀번호가 일치하면 안됩니다',
      );
    }
    const userId = req.user['userId'];
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  // @ApiOperation({ summary: '로그아웃' })
  // @Post('logout')
  // async logout(@Body() loginuserDto: LoginUserDto) {
  //   return await this.userService.logout(loginuserDto.email);
  // }
  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '회원탈퇴',
  })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴가 완료되며, 탈퇴한 회원정보가 반환됩니다.',
  })
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.userService.deleteUser(userId);
  }

  // 마이페이지 유저 정보 조회 (프로필이미지, 닉네임, 이메일, 목표 시간 등)
  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 조회',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 닉네임을 조회합니다.',
    content: {
      examples: GetProfileExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    console.log(req.user);
    const userId = req.user['userId'];
    return this.userService.getProfile(userId);
  }

  @Put('me/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 수정',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 닉네임을 수정합니다.',
    content: {
      examples: UpdateProfileExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user['userId'];
    return this.userService.updateProfile(userId, updateProfileDto);
  }
  @Post('me/profile/image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 이미지 수정',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user['userId'];
    return this.userService.updateProfileImage(userId, file);
  }

  @Delete('me/profile/image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 이미지 삭제',
  })
  @UseGuards(JwtAuthGuard)
  async deleteProfileImage(@Req() req: any) {
    const userId = req.user['userId'];
    return this.userService.deleteProfileImage(userId);
  }
}
