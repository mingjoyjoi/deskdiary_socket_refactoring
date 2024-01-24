import { Injectable, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ForsaveRoomAndUserData,
  IRoomRequest,
  RoomData,
  UserData,
} from './room-chats.interface';
import { Logger } from '@nestjs/common';
import { Exception } from '../exception/exception';
import axios from 'axios';
import { baseURL } from '../constant/url.constant';
import { RoomchatsRepository } from './room-chats.repository';
import { RoomEvent } from './room-chats.events';
import { WsException } from '@nestjs/websockets';
import { WsExceptionFilter } from 'src/filter/socket.exception.filter';

@Injectable()
export class RoomchatsService {
  private logger: Logger = new Logger('RoomchatsService');

  constructor(private roomchatsRepository: RoomchatsRepository) {
    this.logger.log('RoomchatsService constructor');
  }

  async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    const { uuid, userId } = iRoomRequest;
    let user: string;
    try {
      user = await this.roomchatsRepository.getUserInfo(userId);
    } catch (err) {
      return this.emitEventForError(client, server, Exception.userSearchError);
    }
    if (user) {
      this.emitEventForAlreadyConnected(client);
      client.join(uuid);
      return await this.leaveRoomRequestToApiServer(uuid);
    }
    const result = await this.createOrUpdateRoomByRoomExistence(
      client,
      server,
      iRoomRequest,
    );
    if (!result) {
      return this.emitEventForError(client, server, Exception.roomCreateError);
    }
    this.emitEventForNewUserAndUserList(client, server, iRoomRequest);
  }

  async createOrUpdateRoomByRoomExistence(
    client: Socket,
    server: Server,
    iRoomRequest: IRoomRequest,
  ): Promise<boolean> {
    try {
      const { uuid } = iRoomRequest;
      const exist = await this.roomchatsRepository.getRoomInfo(uuid);
      const roomData: RoomData = !exist
        ? this.makeFirstRoomData(client.id, iRoomRequest)
        : this.makeUpdatedRoomData(client.id, iRoomRequest, exist);
      const userData: UserData = this.makeUserData(client, iRoomRequest);
      await this.roomchatsRepository.saveRoomAndUser(
        iRoomRequest,
        roomData,
        userData,
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async RemoveRoomFromMainPage(client: Socket, server: Server, uuid: string) {
    const room = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!room) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
    }
    await this.removeUsersFromRoom(room);
    await this.roomchatsRepository.removeRoom(uuid);
    this.emitEventForKickUsersAndEmptyUserList(server, uuid);
  }

  async leaveRoom(client: Socket, server: Server, uuid: string) {
    const room = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!room) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
    }
    const roomData: RoomData = JSON.parse(room);
    const clientId = client.id;
    const { userId, nickname } = roomData.userList[clientId];
    const userData: UserData = { userId, clientId, nickname, uuid };

    delete roomData.userList[clientId];
    const userListArr = Object.values(roomData['userList']);
    await this.RemoveUserAndUpdateRoomByisEmptyRoom(
      userListArr,
      userData,
      roomData,
    );
    this.emitEventForLeaveUserAndUserList(server, userData, userListArr);
  }

  async handleLogoutInOtherBrowser(
    client: Socket,
    server: Server,
    userId: number,
  ) {
    let exist: string;
    try {
      exist = await this.roomchatsRepository.getUserInfo(userId);
    } catch (err) {
      return this.emitEventForError(client, server, Exception.userSearchError);
    }
    if (!exist) return;
    const userData: UserData = JSON.parse(exist);
    const { uuid, clientId } = userData;

    const room = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!room) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
    }
    const roomData = JSON.parse(room);
    delete roomData.userList[clientId];
    const userListArr = Object.values(room['userList']);

    userData['userId'] = userId;
    await this.RemoveUserAndUpdateRoomByisEmptyRoom(
      userListArr,
      userData,
      roomData,
    );
    this.emitEventForKickUserByLogOut(server, userData);
    this.emitEventForLeaveUserAndUserList(server, userData, userListArr);
    await this.leaveRoomRequestToApiServer(uuid);
  }

  async disconnectClient(client: Socket, server: Server) {
    const uuid = await this.roomchatsRepository.getRoomIdByClientId(client.id);
    if (!uuid) {
      return this.emitEventForError(client, server, Exception.clientNotFound);
    }
    await this.leaveRoom(client, server, uuid);
    await this.leaveRoomRequestToApiServer(uuid);
    this.logger.log(`disconnected: ${client.id}`);
  }

  async emitEventForNewUserAndUserList(
    client: Socket,
    server: Server,
    iRoomRequest: IRoomRequest,
  ) {
    const { uuid, nickname } = iRoomRequest;
    const userListArr = this.getUserListInRoom(client, server, uuid);
    server.to(uuid).emit(RoomEvent.NewUser, { nickname, userListArr });
  }

  async getUserListInRoom(client: Socket, server: Server, uuid: string) {
    const roomData = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!roomData) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
    }
    const room: RoomData = JSON.parse(roomData);
    const userListObj = room['userList'];
    const userListArr = Object.values(userListObj);
    return userListArr;
  }

  emitEventForError(client: Socket, server: Server, errorType) {
    server.to(client.id).emit(RoomEvent.Error, errorType);
  }

  emitEventForKickUsersAndEmptyUserList(server: Server, uuid: string) {
    server.to(uuid).emit(RoomEvent.RemoveUsers, {});
  }

  emitToRoom(server: Server, uuid: string, event: string, data) {
    server.to(uuid).emit(event, data);
  }

  emitEventForAlreadyConnected(client: Socket) {
    client.emit(RoomEvent.JoinError, Exception.clientAlreadyConnected);
  }

  emitEventForLeaveUserAndUserList(
    server: Server,
    userData: UserData,
    userListArr,
  ) {
    const { uuid, nickname } = userData;
    server.to(uuid).emit(RoomEvent.LeaveUser, { nickname, userListArr });
  }

  emitEventForKickUserByLogOut(server: Server, userData: UserData) {
    const { uuid, userId } = userData;
    server.to(uuid).emit(RoomEvent.logOut, { logoutUser: userId });
  }

  makeUserData(client: Socket, iRoomRequest: IRoomRequest) {
    const { uuid, nickname } = iRoomRequest;
    const userData: UserData = {
      clientId: client.id,
      uuid,
      nickname,
    };
    return userData;
  }

  makeUpdatedRoomData(
    clientId: string,
    iRoomRequest: IRoomRequest,
    roomData: string,
  ) {
    const { nickname, img, userId } = iRoomRequest;
    const updatedRoomData: RoomData = JSON.parse(roomData);
    updatedRoomData.userList[clientId] = { nickname, img, userId };
    return updatedRoomData;
  }

  makeFirstRoomData(clientId: string, iRoomRequest: IRoomRequest) {
    const { nickname, img, userId } = iRoomRequest;
    const roomData: RoomData = {
      userList: { [clientId]: { nickname, img, userId } },
    };
    return roomData;
  }

  async removeUsersFromRoom(roomdata) {
    const findRoom = JSON.parse(roomdata);
    for (const clientId in findRoom.userList) {
      const userId: number = findRoom.userList[clientId]?.userId;
      await this.roomchatsRepository.removeUser(userId, clientId);
      this.logger.log(`유저 데이터 삭제함: client:${clientId}, user:${userId}`);
    }
  }

  async RemoveUserAndUpdateRoomByisEmptyRoom(
    userListArr,
    userData: UserData,
    roomData: RoomData,
  ) {
    const isEmpty = userListArr.length === 0;
    if (isEmpty) {
      await this.roomchatsRepository.removeRoomAndUser(userData);
    } else {
      await this.roomchatsRepository.updateRoomAndRemoveUser(
        roomData,
        userData,
      );
    }
  }

  @UseFilters(WsExceptionFilter)
  async leaveRoomRequestToApiServer(uuid: string): Promise<void> {
    const headers = {
      'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
    };
    await axios.post(`${baseURL}/room/socket/leave/${uuid}`, undefined, {
      headers,
    });
  }
}
