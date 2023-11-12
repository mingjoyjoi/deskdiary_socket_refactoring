import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function SwaggerConfig(app: INestApplication): void {
  const option = new DocumentBuilder()
    .setTitle('책상일기 API')
    .setDescription('책상일기의 API 문서입니다.')
    .setContact('책상일기 개발팀', '', '')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, option);
  SwaggerModule.setup('api', app, document);
}
