import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './imagetest.controller';

@Module({
  providers: [ImageService],
  exports: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
