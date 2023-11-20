import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';
import { Logger } from '@nestjs/common';
import 'dotenv/config';

export const pubClient: RedisClientType = createClient({
  url: `redis://:${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    connectTimeout: 10000,
  },
});

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private logger = new Logger('RedisIoAdapter');

  async connectToRedis(): Promise<void> {
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    this.logger.log('Socket.io 서버와 Redis 어댑터 연결 성공!');
    Logger.log(
      `Redis Adapted ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    );
    return server;
  }
}
