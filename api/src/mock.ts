import { datatype, internet, lorem, image, random } from 'faker';
export const mockUuid = '550e8400-e29b-41d4-a716-446655440000';
export const mockRoom = {
  roomId: datatype.number(),
  uuid: mockUuid,
  agoraAppId: random.uuid(),
  agoraToken: random.uuid(),
  title: lorem.words(),
  note: lorem.sentence(),
  ownerId: datatype.number(),
  nowHeadcount: 3,
  maxHeadcount: 5,
  roomThumbnail: image.imageUrl(),
  category: 'study',
  count: datatype.number(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOwner = {
  userId: datatype.number(),
  email: internet.email(),
  nickname: internet.userName(),
  password: random.uuid(),
  profileImage: image.imageUrl(),
  snsId: internet.userName(),
  provider: 'local',
  type: 'user',
  refreshToken: random.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
};
