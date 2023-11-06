import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(CorsConfig);
  await app.listen(4001);
}
bootstrap();
