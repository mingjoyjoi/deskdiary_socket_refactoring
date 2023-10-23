// // room.seed.ts
// import { fakerKO as faker } from '@faker-js/faker';

// enum Category {
//   Study = 'study',
//   Hobby = 'hobby',
// }

// export function createRandomRoom(ownerId: number) {
//   const uuid = faker.string.uuid();
//   const agoraAppId = faker.string.uuid(); // 또는 실제 Agora App ID를 사용
//   const agoraToken = faker.string.uuid(); // 또는 실제 Agora Token을 사용
//   const count = faker.number.int({ min: 1, max: 100 });
//   const title = faker.person.jobType();
//   const note = faker.word.adjective(100);
//   const nowHeadcount = faker.number.int({ min: 1, max: 1 });
//   const maxHeadcount = faker.number.int({ min: 2, max: 4 });
//   const roomThumbnail = faker.image.url(); // 또는 실제 이미지 URL을 사용
//   const category = faker.helpers.enumValue(Category);

//   return {
//     uuid,
//     agoraAppId,
//     agoraToken,
//     count,
//     title,
//     note,
//     ownerId,
//     nowHeadcount,
//     maxHeadcount,
//     roomThumbnail,
//     category,
//   };
// }
// export const ROOMS = (faker as any).helpers.multiple(createRandomRoom, {
//   count: 5,
// });

// export function createRandomHistory(UserId: number, RoomId: number) {
//   const nickname = faker.internet.userName();
//   const checkIn = faker.date.past();
//   const checkOut = faker.date.between(checkIn, new Date());
//   const totalHours = Math.ceil(
//     (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60),
//   );
//   const historyType = faker.helpers.arrayElement([
//     'normal',
//     'special',
//     'event',
//   ]);

//   return {
//     UserId,
//     RoomId,
//     nickname,
//     checkIn,
//     checkOut,
//     totalHours,
//     historyType,
//   };
// }
