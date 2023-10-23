// // room.seed.service.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { createRandomRoom } from './room.seed';

// @Injectable()
// export class RoomSeedService {
//   constructor(private readonly prisma: PrismaService) {}

//   async seed(ownerId: number) {
//     const roomsToCreate = Array.from({ length: 1 }, () =>
//       createRandomRoom(ownerId),
//     );

//     for (const room of roomsToCreate) {
//       await this.prisma.room.create({
//         data: room,
//       });
//     }
//   }
// }
