import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
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
  ): void {
    const emitMessage: IMessage = {
      message: `${message} from ${NODE_PORT}`,
      time: LocalDateTime.now().plusHours(9),
      nickname,
      uuid,
    };
    this.logger.log(emitMessage);

    this.server.to(uuid).emit('msgToClient', emitMessage);
  }

  //방에 참석함
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { nickname, uuid, img }: IRoomRequest,
  ) {
    client.leave(client.id);
    client.join(uuid);

    // 성공 응답 보내기
    return { event: 'joinRoom', data: { success: true } };

    this.roomchatsService.joinRoom(client, this.server, {
      nickname,
      uuid,
      img,
    });

    // 성공 응답 보내기
    return { event: 'joinRoom', data: { success: true } };
  }

  //방을 삭제함
  @SubscribeMessage('removeRoom')
  handleRemoveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    this.roomchatsService.removeRoom(client, this.server, uuid);
  }

  //방을 떠남
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    client.leave(uuid);
    this.roomchatsService.leaveRoom(client, this.server, uuid);
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
