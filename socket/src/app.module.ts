import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RoomchatsModule } from './gateway/room-chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { pubClient } from './redis.adapter';
import RedisStore from 'connect-redis';
import session from 'express-session';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    RoomchatsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({ client: pubClient }),
          secret: 'secret',
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes('*');
  }
}
