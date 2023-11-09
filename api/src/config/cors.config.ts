import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CorsConfig: CorsOptions = {
  origin: [
    'https://desk-diary.com',
    'http://localhost:3000',
    'https://deskdiary-fe-brown.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'access-control-allow-origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Socket-Secret-Key',
  ],
  exposedHeaders: ['Authorization', 'Socket-Secret-Key'],
  credentials: true,
  maxAge: 3600,
  optionsSuccessStatus: 204,
};
