import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUniqueNickname(): Promise<string> {
    const randomLength = 2;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    while (true) {
      let randomString = '';
      for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }

      const randomNickname = `엉덩${randomString}호`;
      const existingUser = await this.prisma.user.findFirst({
        where: { nickname: randomNickname },
      });
      if (!existingUser) {
        return randomNickname;
      }
    }
  }
}
