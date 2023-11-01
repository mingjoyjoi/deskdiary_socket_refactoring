import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CorsConfig: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'https://deskdiary-fe-brown.vercel.app',
    'https://desk-diary.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'access-control-allow-origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 3600,
  optionsSuccessStatus: 204,
};
