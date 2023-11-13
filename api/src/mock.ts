import { faker } from '@faker-js/faker';
export const mockUuid = '550e8400-e29b-41d4-a716-446655440000';
faker.seed(123);
export const mockRoom = {
  roomId: faker.number.int(),
  uuid: mockUuid,
  agoraAppId: faker.string.uuid(),
  agoraToken: faker.string.uuid(),
  title: faker.lorem.word(),
  note: faker.lorem.sentence(),
  ownerId: faker.number.int(),
  nowHeadcount: 3,
  maxHeadcount: 5,
  roomThumbnail: faker.string.alphanumeric(8),
  category: 'study',
  count: faker.number.int(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOwner = {
  userId: faker.number.int(),
  email: faker.internet.email(),
  nickname: faker.internet.userName(),
  password: faker.string.uuid(),
  profileImage: faker.string.alphanumeric(8),
  snsId: faker.internet.userName(),
  provider: 'local',
  type: 'user',
  refreshToken: faker.string.uuid(),
  signupVerifyToken: faker.string.uuid(),
  isEmailVerified: faker.datatype.boolean(),
  createdAt: new Date(),
  updatedAt: new Date(),
};
