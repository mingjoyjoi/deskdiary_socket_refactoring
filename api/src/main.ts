import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { CorsConfig, SwaggerConfig } from './config';
import { HttpExceptionFilter } from './filter/http-exception.filter';
// import { RoomSeedService } from './room/room.seed.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'static'), {
    prefix: '/static/',
  });

  SwaggerConfig(app);
  app.enableCors(CorsConfig);
  await app.listen(4000);
}
bootstrap();
