import { ArgumentsHost, Catch } from '@nestjs/common';
import { WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { AxiosError } from 'axios';
import { Exception } from 'src/exception/exception';
import { RoomEvent } from 'src/gateway/room-chats.events';

@Catch(AxiosError)
export class AxiosErrorFilter extends BaseWsExceptionFilter {
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
    socket.emit(RoomEvent.Error, Exception.roomLeaveError);
  }
}

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();
    if (exception.message === Exception.clientAlreadyConnected) {
      return socket.emit(RoomEvent.JoinError, Exception.clientAlreadyConnected);
    }
    socket.emit(RoomEvent.Error, exception.message);
  }
}

@Catch()
export class ExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();
    socket.emit(RoomEvent.Error, exception.message);
  }
}
