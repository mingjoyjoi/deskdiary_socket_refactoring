// import { mockRoom, mockOwner, mockUuid } from './../mock';
// import { Test, TestingModule } from '@nestjs/testing';
// import { RoomService } from './room.service';
// import { UserService } from '../user/user.service';
// import { RoomRepository } from './room.repository';
// import { RoomException } from '../exception/room.exception';
// import { UserException } from '../exception/user.exception';
// import { faker } from '@faker-js/faker';

// describe('RoomService', () => {
//   let roomService: RoomService;
//   let userService: UserService;
//   let roomRepository: RoomRepository;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [RoomService, UserService, RoomRepository],
//     }).compile();

//     roomService = module.get<RoomService>(RoomService);
//     userService = module.get<UserService>(UserService);
//     roomRepository = module.get<RoomRepository>(RoomRepository);
//   });

//   it('should be defined', () => {
//     expect(roomService).toBeDefined();
//   });

//   it('uuid를 통해 방정보와 방의 owner 정보를 조회함.', async () => {
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);
//     jest.spyOn(userService, 'findUserByUserId').mockResolvedValue(mockOwner);

//     const uuid = mockUuid;
//     const result = await roomService.getRoomByUUID(uuid);

//     expect(result.findRoom).toBe(mockRoom);
//     expect(result.owner).toBe(mockOwner);
//   });

//   it('잘못된 uuid로 방정보를 조회할 경우 에러를 반환함', async () => {
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(null);
//     const uuid = faker.string.uuid();
//     try {
//       await roomService.getRoomByUUID(uuid);
//     } catch (error) {
//       expect(error).toBeInstanceOf(RoomException);
//       expect(error.message).toBe(RoomException.roomNotFound().message);
//     }
//   });

//   it('방의 owner에 대한 정보를 찾을 수 없을 경우 에러를 반환함', async () => {
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);
//     jest.spyOn(userService, 'findUserByUserId').mockResolvedValue(null);

//     const uuid = mockUuid;

//     try {
//       await roomService.getRoomByUUID(uuid);
//     } catch (error) {
//       expect(error).toBeInstanceOf(UserException);
//       expect(error.message).toBe(UserException.userNotFound().message);
//     }
//   });

//   it('방에 성공적으로 접속함', async () => {
//     const joinRoomMock = { ...mockRoom };
//     joinRoomMock.nowHeadcount++;
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);
//     jest
//       .spyOn(roomRepository, 'updateRoomByJoin')
//       .mockResolvedValue(joinRoomMock);

//     const uuid = mockUuid;

//     const result = await roomService.joinRoom(uuid);
//     expect(result).toBe(true);
//   });

//   it('방인원이 가득찬 경우 방에 참가할 수 없음, 에러를 반환', async () => {
//     const fullRoomMock = { ...mockRoom };
//     fullRoomMock.nowHeadcount = 9;
//     fullRoomMock.maxHeadcount = 9;

//     jest
//       .spyOn(roomRepository, 'findRoomByUuid')
//       .mockResolvedValue(fullRoomMock);
//     const uuid = mockUuid;
//     await expect(roomService.joinRoom(uuid)).rejects.toThrow(
//       RoomException.roomFullError(),
//     );
//   });

//   it('잘못된 uuid로 요청시 방참가 불가하여 에러를 반환함', async () => {
//     const mockRoom = null;
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);

//     const uuid = faker.string.uuid();
//     await expect(roomService.joinRoom(uuid)).rejects.toThrow(
//       RoomException.roomNotFound(),
//     );
//   });

//   it('방을 성공적으로 나감', async () => {
//     const leaveRoomMock = { ...mockRoom };
//     leaveRoomMock.nowHeadcount--;
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);
//     jest
//       .spyOn(roomRepository, 'updateRoomByLeave')
//       .mockResolvedValue(leaveRoomMock);

//     const uuid = mockUuid;

//     const result = await roomService.leaveRoom(uuid);
//     expect(result).toBe(true);
//   });

//   it('방 참여자가 1보다 작을경우 퇴장이 불가함.', async () => {
//     const leaveRoomMock = { ...mockRoom };
//     leaveRoomMock.nowHeadcount = 0;

//     jest
//       .spyOn(roomRepository, 'findRoomByUuid')
//       .mockResolvedValue(leaveRoomMock);

//     const uuid = mockUuid;

//     await expect(roomService.leaveRoom(uuid)).rejects.toThrow(
//       RoomException.roomLeaveError(),
//     );
//   });

//   it('잘못된 uuid로 요청시 방퇴장 불가하여 에러를 반환함 ', async () => {
//     const mockRoom = null;
//     jest.spyOn(roomRepository, 'findRoomByUuid').mockResolvedValue(mockRoom);

//     const uuid = faker.string.uuid();
//     await expect(roomService.leaveRoom(uuid)).rejects.toThrow(
//       RoomException.roomNotFound(),
//     );
//   });
// });
