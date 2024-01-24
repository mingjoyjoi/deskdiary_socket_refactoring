import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { AxiosError } from 'axios';
import { QueryFailedError } from 'typeorm';

@Catch(AxiosError)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    if (exception.response) {
      console.error('HTTP 에러 상태 코드:', exception.response.status);
      console.error('HTTP 에러 응답 데이터:', exception.response.data);
    } else if (exception.request) {
      console.error('요청에 응답이 없습니다.');
    } else {
      console.error('요청을 보내는 중에 에러 발생:', exception.message);
    }
    const socket = host.switchToWs().getClient();
    socket.emit('error-room', {
      data: '방 나가기 요청 중 오류가 발생했습니다.',
    });
  }
}
