import { LocalDateTime } from '@js-joda/core';

export interface IRoomRequest {
  uuid: string;
  nickname: string;
  img?: string;
}
export interface IMessage {
  language?: string;
  time?: LocalDateTime;
  uuid: string;
  nickname: string;
  message: string;
}
