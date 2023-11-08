// // redis.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import Redis from 'ioredis';
// import { RedisIoAdapter } from 'src/redis.adapter';

// @Module({
//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: async (configService: ConfigService): Promise<Redis> => {
//         const redis = new Redis({
//           host: configService.get<string>('REDIS_HOST'),
//           port: configService.get<number>('REDIS_PORT'),
//           password: configService.get<string>('REDIS_PASSWORD'),
//         });
//         if (!redis.status || redis.status === 'end') {
//           await redis.connect();
//         }
//         return redis;
//       },
//       inject: [ConfigService],
//     },
//     RedisIoAdapter,
//   ],
//   exports: ['REDIS_CLIENT'],
// })
// export class RedisModule {}
