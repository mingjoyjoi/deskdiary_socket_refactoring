import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// import * as jwt from 'jsonwebtoken';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;

  // nodemailer에서 제공하는 Transporter 객체 생성
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerifyToken(email: string, verifyToken: number) {
    const mailOptions: EmailOptions = {
      to: email,
      subject: '[책상일기] 이메일 확인',
      html: `인증번호: ${verifyToken}`,
    };
    // transporter 객체를 이용해 메일 전송
    return await this.transporter.sendMail(mailOptions);
  }
}
