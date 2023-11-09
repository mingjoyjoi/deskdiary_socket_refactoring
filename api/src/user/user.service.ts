import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import * as uuid from 'uuid';
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
    const signupVerifyToken = uuid.v1();

    // 사용자 생성
    await this.prisma.user.create({
      data: {
        email,
        nickname,
        password: hashedPassword,
        signupVerifyToken,
        isEmailVerified: false,
      },
    });

    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );

    return { message: '회원가입에 성공하였습니다.' };
  }

  async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { signupVerifyToken },
    });

    if (!user) {
      throw new NotFoundException('유효하지 않은 인증 토큰입니다.');
    }

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { isEmailVerified: true, signupVerifyToken: signupVerifyToken },
    });

    // return '이메일이 성공적으로 인증되었습니다.';
    return 'https://desk-diary.com/confirm-email';
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

    if (!user.isEmailVerified) {
      throw new HttpException(
        '이메일 인증이 완료되지 않았습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwtPayload = { userId: user.userId, type: 'user' };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.jwtconfigService.createJwtOptions().secret,
      expiresIn: this.jwtconfigService.createJwtOptions().signOptions.expiresIn,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '15d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { refreshToken },
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.setHeader('RefreshToken', `Bearer ${refreshToken}`);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.json({
      message: '로그인에 성공하였습니다.',
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  async renewAccessToken(refreshToken: string, res: Response): Promise<void> {
    console.log('Received refreshToken:', refreshToken);
    let userId: number;
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      userId = decoded.userId;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('유효하지 않은 refreshToken 입니다1.');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
      select: { refreshToken: true },
    });

    if (!user || refreshToken !== user.refreshToken) {
      throw new UnauthorizedException('유효하지 않은 refreshToken 입니다2.');
    }

    const jwtPayload = { userId: userId, type: 'user' };
    const jwtSignOptions = this.jwtconfigService.getJwtSignOptions();
    const newAccessToken = this.jwtService.sign(jwtPayload, jwtSignOptions);
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    res.json({ message: '로그인에 성공하였습니다2.' });
  }

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
    // 우선 데이터베이스에서 사용자의 현재 프로필 이미지를 조회합니다.
    console.log(userId);
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { profileImage: true },
    });

    if (user && user.profileImage) {
      // S3에서 이미지를 삭제합니다.
      const fileName = user.profileImage.split('/').pop(); // URL에서 파일 이름을 추출합니다.
      await this.imageService.deleteImage(fileName);

      // 데이터베이스에서 사용자의 프로필 이미지 URL을 제거합니다.
      console.log(userId);
      return await this.prisma.user.update({
        where: { userId },
        data: { profileImage: null },
      });
    }

    throw new Error('프로필 이미지가 존재하지 않습니다.');
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
}
