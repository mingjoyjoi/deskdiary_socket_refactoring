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
export interface RoomData {
  uuid: string;
  owner: string;
  ownerId: number;
  userList: object;
}
export interface UserData {
  clientId: string;
  uuid: string;
  nickname: string;
  userId: number;
}
export interface UuidData {
  uuid: string;
}
