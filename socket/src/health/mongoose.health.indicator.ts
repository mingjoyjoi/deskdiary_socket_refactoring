import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseHealthIndicator {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async isHealthy(): Promise<boolean> {
    try {
      await this.connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}
