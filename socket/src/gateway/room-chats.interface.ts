export interface IRoomRequest {
  nickname?: string;
  uuid?: string;
  img?: string;
  userId?: number;
}

export interface IMessage {
  time?: string;
  uuid: string;
  nickname: string;
  message: string;
  img: string;
}

export interface UserData {
  clientId?: string;
  uuid?: string;
  nickname?: string;
  userId?: number;
}

export interface RoomData {
  userList: UserList;
}

export interface UserList {
  [clientId: string]: ClientId;
}

export interface ClientId {
  nickname: string;
  img: string;
  userId: number;
}

export interface ForsaveRoomAndUserData {
  iRoomRequest: IRoomRequest;
  roomData: RoomData;
  userData: UserData;
}
