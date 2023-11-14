// redis.module.ts
import { Module } from '@nestjs/common';
import { RedisIoAdapter } from 'src/redis.adapter';

@Module({
  providers: [RedisIoAdapter],
})
export class RedisModule {}
