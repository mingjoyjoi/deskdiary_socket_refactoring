import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { JoinUserDto } from './dto/join.user.dto';
import { LoginUserDto } from './dto/login.user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(joinuserDto: JoinUserDto) {
    const { email, nickname, password } = joinuserDto;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(
        '이메일이 이미 사용중입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await this.prisma.user.create({
      data: {
        email,
        nickname,
        password: hashedPassword,
      },
    });

    return { message: '회원가입에 성공하였습니다.' };
  }

  async login(loginuserDto: LoginUserDto, res: Response): Promise<void> {
    const { email, password } = loginuserDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        '로그인 정보가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwtPayload = { userId: user.userid, type: 'user' };
    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '30m',
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.prisma.user.update({
      where: { userid: user.userid },
      data: { refreshToken },
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    // res.cookie('RefreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    // });
    res.json({ message: '로그인에 성공하였습니다.' });
  }

  // async renewAccessToken(refreshToken: string, res: Response): Promise<void> {
  //   let userId: number;
  //   try {
  //     const decoded = this.jwtService.verify(refreshToken, {
  //       secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
  //     });
  //     userId = decoded.userId;
  //   } catch (error) {
  //     throw new UnauthorizedException('유효하지 않은 refreshToken 입니다.');
  //   }

  //   const user = await this.prisma.user.findUnique({
  //     where: { userid: userId },
  //     select: { userid: true, refreshToken: true },
  //   });

  //   if (!user || user.refreshToken !== refreshToken) {
  //     throw new UnauthorizedException('유효하지 않은 refreshToken 입니다.');
  //   }

  //   const jwtPayload = { userId: user.userid, type: 'User' };
  //   const newAccessToken = this.jwtService.sign(jwtPayload, {
  //     expiresIn: '5m',
  //     secret: this.configService.get<string>('JWT_SECRET'),
  //   });
  //   res.setHeader('Authorization', `Bearer ${newAccessToken}`);
  //   res.json({ message: '로그인에 성공하였습니다.' });
  // }

  async logout(email: string) {
    await this.prisma.user.update({
      where: { email: email },
      data: { refreshToken: null },
    });
    return { message: '로그아웃에 성공하였습니다.' };
  }

  async findOne(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userid: userId },
    });
  }
}
