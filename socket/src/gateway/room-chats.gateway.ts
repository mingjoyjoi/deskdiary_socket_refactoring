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
import { RoomchatsService } from './room-chats.service';
import { IMessage, IRoomRequest } from './room-chats.interface';
import { RoomEvent } from './room-chats.events';
import { getFormattedCurrentTime } from 'src/utils/formatted.time.maker';

@WebSocketGateway({ cors: true, allowEIO3: true })
export class RoomchatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('roomChatsGateway');

  constructor(private readonly roomchatsService: RoomchatsService) {
    this.logger.log('roomChatsGateway constructor');
  }

  // 메시지를 방에 있는 유저들에게 보냄
  @SubscribeMessage(RoomEvent.MsgToServer)
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid, message, nickname, img }: IMessage,
  ): void {
    const time = getFormattedCurrentTime();
    const emitMessage: IMessage = {
      message: message,
      time,
      nickname,
      uuid,
      img,
    };
    this.logger.log(emitMessage);
    this.server.to(uuid).emit(RoomEvent.MsgToClient, emitMessage);
  }

  // 방에 참석함
  @SubscribeMessage(RoomEvent.JoinRoom)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { nickname, uuid, img, userId }: IRoomRequest,
  ): void {
    this.roomchatsService.joinRoom(client, this.server, {
      nickname,
      uuid,
      img,
      userId,
    });
  }

  // 책상기록 페이지에서 방을 삭제함
  @SubscribeMessage(RoomEvent.RemoveRoom)
  handleRemoveRoomFromMainPage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    this.roomchatsService.RemoveRoomFromMainPage(client, this.server, uuid);
  }

  // 방을 떠남
  @SubscribeMessage(RoomEvent.LeaveRoom)
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    client.leave(uuid);
    this.roomchatsService.leaveRoom(client, this.server, uuid);
  }

  //로그아웃
  @SubscribeMessage(RoomEvent.logOut)
  handleLogOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userId }: IRoomRequest,
  ): void {
    this.roomchatsService.handleLogoutInOtherBrowser(
      client,
      this.server,
      userId,
    );
  }

  //회원탈퇴로 인한 방 퇴장시키기
  // @SubscribeMessage('withdrawal')
  // handleKickRoomByWithdrawal(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() { userId }: IRoomRequest,
  // ): void {
  //   this.logger.log('회원탈퇴 이벤트 받음');
  //   this.roomchatsService.KickRoomByWithdrawal(client, this.server, userId);
  // }

  afterInit() {
    this.logger.log('init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log('disconnected');
    this.roomchatsService.disconnectClient(client, this.server);
  }
}
