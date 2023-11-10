import { Module } from '@nestjs/common';
import { MongooseHealthIndicator } from './mongoose.health.indicator';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [MongooseHealthIndicator],
})
export class HealthModule {}
