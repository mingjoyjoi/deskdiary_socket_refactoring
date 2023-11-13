import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis.adapter';
import { CorsConfig } from './config/cors.config';
import { INestApplication } from '@nestjs/common';

async function getNestApplicationByEnv(): Promise<INestApplication> {
  return await NestFactory.create(AppModule);
}

async function bootstrap() {
  const app = await getNestApplicationByEnv();
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors(CorsConfig);

  await app.listen(4001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
