import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocalDateTime } from '@js-joda/core';
import { RoomchatsService } from './room-chats.service';
import { IMessage, IRoomRequest } from './room-chats.interface';

const NODE_PORT = 4000;

@WebSocketGateway({ cors: true, allowEIO3: true })
export class RoomchatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly roomchatsService: RoomchatsService) {}

  //메시지를 방에 있는 유저들에게 보냄
  @SubscribeMessage('msgToServer')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid, message, nickname }: IMessage,
  ): WsResponse<any> {
    const emitMessage: IMessage = {
      message: `${message} from ${NODE_PORT}`,
      time: LocalDateTime.now().plusHours(9),
      nickname,
      uuid,
    };
    this.logger.log(emitMessage);
    console.log('소켓이 참여한 방', client.rooms);
    console.log('방에 참가한 소켓에 메시지 뿌림');

    this.server.to(uuid).emit('msgToClient', emitMessage);

    return { event: 'msgToServer', data: { success: true } };
  }

  //방에 참석함
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { nickname, uuid, img }: IRoomRequest,
  ): WsResponse<any> {
    console.log('소켓아이디 leave 하기 전');
    client.leave(client.id);

    console.log('방 참석 전', client.rooms);
    client.join(uuid);

    console.log('방 참석 후', client.rooms);

    console.log(' new-user 이벤트 날리기 전');

    client.emit('new-user', nickname);

    console.log('new-user 이벤트 날린 후 ');
    return { event: 'joinRoom', data: { success: true } };

    this.roomchatsService.joinRoom(client, this.server, {
      nickname,
      uuid,
      img,
    });
  }

  //방을 삭제함
  @SubscribeMessage('removeRoom')
  handleRemoveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): WsResponse<any> {
    this.roomchatsService.removeRoom(client, this.server, uuid);
    return { event: 'removeRoom', data: { success: true } };
  }

  //방을 떠남
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): WsResponse<any> {
    client.leave(uuid);
    this.roomchatsService.leaveRoom(client, this.server, uuid);
    return { event: 'leave-room', data: { success: true } };
  }

  afterInit() {
    this.logger.log('init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.roomchatsService.disconnectClient(client, this.server);
  }
}
