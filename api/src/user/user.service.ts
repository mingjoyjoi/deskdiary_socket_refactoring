import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JoinUserDto } from './dto/join.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { UpdateProfileDto } from './dto/update.profile.dto';
import { JwtConfigService } from '../config/jwt.config.service';
import { User } from '@prisma/client';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { ImageService } from '../image/image.service';
import { EmailService } from '../auth/email/email.service';
//import { randomNickname } from './constant/random-nickname';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtconfigService: JwtConfigService,
    private readonly jwtService: JwtService,
    private readonly imageService: ImageService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(joinuserDto: JoinUserDto) {
    const { email, nickname, password } = joinuserDto;

    // 이메일 중복 확인
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new HttpException(
        '이메일이 이미 사용중입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUserByNickname = await this.prisma.user.findFirst({
      where: { nickname },
    });

    if (existingUserByNickname) {
      throw new HttpException(
        '닉네임이 이미 사용중입니다.',
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

    const jwtPayload = { userId: user.userId, type: 'user' };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.jwtconfigService.createJwtOptions().secret,
      expiresIn: this.jwtconfigService.createJwtOptions().signOptions.expiresIn,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { refreshToken },
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    // res.cookie('RefreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    // });
    res.json({ message: '로그인에 성공하였습니다.', token: accessToken });
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

  //함수명 수정함 findOne에서
  async findUserByUserId(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userId: userId },
    });
  }

  /** -------------------- 카카오 로그인 ----------------
   * 카카오 로그인을 위한 사용자 조회 또는 생성 메서드
   * @param user 사용자 정보 객체
   * @returns User 데이터베이스에 저장된 사용자 정보
   */
  async findOrCreateKakaoUser(user: {
    email: string;
    nickname: string;
    snsId: string;
    provider: string;
  }): Promise<User> {
    const { email, snsId, nickname } = user;

    let existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email,
          nickname,
          snsId,
          provider: 'Kakao',
          password: 'KAKAO_SNS_LOGIN',
        },
      });
    }

    return existingUser;
  }

  // -------------- 구글 로그인 ---------------------
  async findOrCreateGoogleUser(user: {
    email: string;
    nickname: string;
    snsId: string;
    provider: string;
  }): Promise<User> {
    const { email, snsId, nickname } = user;

    let existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email,
          nickname,
          snsId,
          provider: 'Google',
          password: 'GOOGLE_SNS_LOGIN',
        },
      });
    }

    return existingUser;
  }

  // 비밀번호 수정
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        password: true,
      },
    });
    // 사용자의 현재 비밀번호와 DB의 비밀번호가 일치하는지 확인
    if (
      !existingUser ||
      !(await bcrypt.compare(dto.password, existingUser.password))
    ) {
      throw new Error('Incorrect current password');
    }

    // 새로운 비밀번호를 암호화
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    // DB에 새로운 비밀번호를 업데이트
    return await this.prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });
  }

  // 프로필 조회 및 수정
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        nickname: true,
        provider: true,
        profileImage: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`${userId}를 찾을 수 없습니다.`);
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        nickname: true,
      },
    });
    if (!existingUser) {
      throw new NotFoundException(`${userId}를 찾을 수 없습니다.`);
    }
    return await this.prisma.user.update({
      where: { userId },
      data: dto,
    });
  }

  async updateProfileImage(userId: number, file: Express.Multer.File) {
    const uploadedData = await this.imageService.uploadImage(
      file,
      'profile-images',
    );
    return await this.prisma.user.update({
      where: { userId },
      data: {
        profileImage: uploadedData.Location,
      },
    });
  }
  async deleteProfileImage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { profileImage: true },
    });

    if (user && user.profileImage) {
      // S3 파일 URL에서 파일 이름을 추출합니다.
      const url = new URL(user.profileImage);
      const fileName = url.pathname.substring(1); // URL의 첫 번째 '/' 문자를 제거합니다.

      // deleteImage 메소드를 사용하여 S3에서 이미지를 삭제합니다.
      try {
        await this.imageService.deleteImage(fileName);
      } catch (error) {
        // 로그를 남기거나, 오류를 처리하는 로직을 추가할 수 있습니다.
        throw new Error('S3에서 이미지를 삭제하는 데 실패했습니다.');
      }
    }

    // Prisma를 사용하여 데이터베이스에서 이미지 URL을 null로 설정합니다.
    return this.prisma.user.update({
      where: { userId },
      data: {
        profileImage: null,
      },
    });
  }

  async deleteUser(userId: number) {
    const deletedUser = await this.prisma.user.delete({
      where: { userId },
    });
    if (!deletedUser) {
      throw new NotFoundException(`${userId}를 찾을 수 없습니다.`);
    }
    return deletedUser;
  }

  async sendVerification(email: string) {
    const verifyToken = this.generateRandomNumber();

    console.log('캐싱할 데이터: ', email, verifyToken);
    // TODO: verifyToken이랑 이메일 캐싱

    await this.sendVerifyToken(email, verifyToken);
  }

  async sendVerifyToken(email: string, verifyToken: number) {
    await this.emailService.sendVerifyToken(email, verifyToken);
  }

  async verifyEmail(email: string, verifyToken: number) {
    console.log('verifyEmail: ', email, verifyToken);
    // TODO: 캐싱된 데이터 찾기. 있으면 200, 없으면 Exception
    return;
  }

  private generateRandomNumber(): number {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }
}
