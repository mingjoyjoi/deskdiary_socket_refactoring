import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongooseHealthIndicator } from './mongoose.health.indicator';

@Controller('health')
export class HealthController {
  constructor(private mongooseHealthIndicator: MongooseHealthIndicator) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const isDbHealthy = await this.mongooseHealthIndicator.isHealthy();
    if (!isDbHealthy) {
      throw new HttpException(
        { database: 'unhealthy' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { database: 'healthy' };
  }
}
