// redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisIoAdapter } from 'src/redis.adapter';

@Module({
  providers: [RedisIoAdapter],
})
export class RedisModule {}
