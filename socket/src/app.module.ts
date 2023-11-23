import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RoomchatsModule } from './gateway/room-chats.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    RoomchatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(
//         session({
//           store: new RedisStore({
//             client: pubClient,
//           }),
//           secret: 'your_secret',
//           resave: false,
//           saveUninitialized: false,
//           cookie: {
//             secure: true,
//             path: '/',
//             maxAge: 24 * 60 * 60 * 1000,
//           },
//         }),
//       )
//       .forRoutes('*');
//   }
// }
