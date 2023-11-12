export interface NewRoom {
  title: string;
  maxHeadcount: number;
  note: string;
  category: string;
  uuid: string;
  agoraAppId: string;
  agoraToken: string;
  roomThumbnail: string;
  ownerId: number;
  count: number;
}
