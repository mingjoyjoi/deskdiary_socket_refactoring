import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService, ObjectStorageData } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ObjectStorageData> {
    console.log('File:', file);
    return await this.imageService.uploadImage(file);
  }

  @Delete('delete/:imageName')
  async deleteImage(@Param('imageName') imageName: string) {
    return await this.imageService.deleteImage(imageName);
  }
}
