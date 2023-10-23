import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { CorsConfig, SwaggerConfig } from './config';
// import { RoomSeedService } from './room/room.seed.service';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const roomSeedService = app.get(RoomSeedService);
  // await roomSeedService.seed(4);
  // const historySeedService = app.get(HistorySeedService);
  // await historySeedService.seed(1, 224);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'static'), {
    prefix: '/static/',
  });

  SwaggerConfig(app);
  app.enableCors(CorsConfig);
  await app.listen(4000);
}
bootstrap();
