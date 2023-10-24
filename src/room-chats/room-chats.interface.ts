import { LocalDateTime } from '@js-joda/core';

export interface IRoomRequest {
  uuid: string;
  nickname: string;
}
export interface IMessage {
  language?: string;
  time?: LocalDateTime;
  img?: string;
  uuid: string;
  nickname: string;
  message: string;
}
