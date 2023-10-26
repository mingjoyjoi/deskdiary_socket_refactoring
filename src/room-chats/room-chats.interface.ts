export interface IRoomRequest {
  nickname: string;
  uuid: string;
  img?: string;
}
export interface IMessage {
  language?: string;
  time?: string;
  uuid: string;
  nickname: string;
  message: string;
  img: string;
}
