import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { ImageModule } from './image/image.module';
import { UserDetailModule } from './user-detail/user-detail.module';
import { RoomSearchModule } from './room-search/room-search.module';
import { HistoryModule } from './history/history.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RoomchatsModule } from './room-chats/room-chats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    PrismaModule,
    AuthModule,
    UserModule,
    RoomModule,
    ImageModule,
    UserDetailModule,
    RoomSearchModule,
    HistoryModule,
    RoomchatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  private readonly isDev: boolean =
    process.env.MODE === 'development' ? true : false;

  // dev mode일 때 HTTP 요청 로그 남기는 부분
  configure(consumer: MiddlewareConsumer) {
    mongoose.set('debug', this.isDev);
    if (this.isDev) {
      consumer.apply(LoggerMiddleware).forRoutes('*');
    }
  }
}
