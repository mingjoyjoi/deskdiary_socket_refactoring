import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

export interface ObjectStorageData {
  ETag: string;
  Location: string;
  key: string;
  Bucket: string;
}

@Injectable()
export class ImageService {
  private readonly s3: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.s3 = new AWS.S3();
  }

  async uploadImage(image: Express.Multer.File): Promise<ObjectStorageData> {
    const param = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now().toString()}-${image.originalname}`,
      ACL: 'public-read',
      Body: image.buffer,
    };
    return new Promise((resolve, reject) => {
      this.s3.upload(param, (err, data) => {
        if (err) {
          console.error('Error occurred:', err);
          reject(err);
        }
        console.log('Original File name:', image.originalname);
        resolve(data);
      });
    });
  }

  async deleteImage(imageName: string) {
    const param = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
    };

    return new Promise((resolve, reject) => {
      this.s3.deleteObject(param, (err, data) => {
        if (err) {
          reject(err.message);
        }
        resolve(data);
      });
    });
  }
}
