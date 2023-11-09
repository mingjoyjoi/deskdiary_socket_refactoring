import { BadRequestException, Injectable } from '@nestjs/common';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { ImageService } from '../image/image.service';
import { UserService } from '../user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { RoomException } from '../exception/room.exception';
import { UserException } from '../exception/user.exception';
import { CheckoutRoomRequestDto } from './dto/checkout-room.dto';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { RoomRepository } from './room.repository';
import { NewRoom } from './room.interface';
import { CreateHistoryDto } from './dto/create-history.dto';
// import { createRandomRoom } from './room.seed';

export interface ThumbnailUploadResult {
  message: string;
  roomThumbnail: string;
}
@Injectable()
export class RoomService {
  constructor(
    private roomRepository: RoomRepository,
    private userService: UserService,
    private imageService: ImageService,
  ) {}

  async createRoom(
    createRoomRequestDto: CreateRoomRequestDto,
    userId: number,
    roomThumbnail: string,
  ) {
    const { title, maxHeadcount, note, category } = createRoomRequestDto; //직접 가져오는값
    const uuid = uuidv4(); //고유한 문자열 생성
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();
    const agoraAppId: string = process.env.AGORA_APP_ID ?? '';
    const agoraToken = this.createTokenWithChannel(agoraAppId, uuid);
    const newRoom: NewRoom = {
      title,
      maxHeadcount: +maxHeadcount,
      note,
      category,
      uuid,
      agoraAppId,
      agoraToken,
      roomThumbnail,
      ownerId: userId,
      count: 0,
    };
    const createdRoom = await this.roomRepository.createRoom(newRoom);
    const owner = await this.userService.findUserByUserId(userId);
    //룸정보, 룸오너 정보 같이 리턴해주기
    return { createdRoom, owner };
  }

  async getRoomListAll() {
    const findRooms = await this.roomRepository.findManyRoom();
    return findRooms;
  }
  async getRoomByUUID(uuid: string) {
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);
    if (!findRoom) throw RoomException.roomNotFound();
    const userId = findRoom.ownerId;
    const owner = await this.userService.findUserByUserId(userId);
    if (!owner) throw UserException.userNotFound();
    return { findRoom, owner };
  }

  async joinRoom(uuid: string): Promise<boolean> {
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);
    if (!findRoom) throw RoomException.roomNotFound();
    if (findRoom.nowHeadcount === findRoom.maxHeadcount)
      throw RoomException.roomFullError();

    const updateResult = await this.roomRepository.updateRoomByJoin(uuid);

    if (!updateResult) throw RoomException.roomJoinError();
    return true;
  }

  async leaveRoom(uuid: string): Promise<boolean> {
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);
    if (!findRoom) throw RoomException.roomNotFound();
    if (findRoom.nowHeadcount < 1) throw RoomException.roomLeaveError();

    const updateResult = await this.roomRepository.updateRoomByLeave(uuid);
    if (!updateResult) throw RoomException.roomLeaveError();
    return true;
  }

  async checkoutRoom(
    checkoutRoomRequestDto: CheckoutRoomRequestDto,
    uuid: string,
    userId: number,
  ) {
    const { checkIn, checkOut, totalHours, historyType } =
      checkoutRoomRequestDto;
    const totalSeconds = this.timeStringToSeconds(totalHours);
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);

    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();

    const roomId = findRoom.roomId;
    const newHistory: CreateHistoryDto = {
      checkIn,
      checkOut,
      historyType,
      totalHours: totalSeconds,
      UserId: userId,
      RoomId: roomId,
    };
    const recordedHistory = await this.roomRepository.createHistory(newHistory);

    return recordedHistory;
  }

  async deleteRoom(userId: number, uuid: string): Promise<boolean> {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) throw UserException.userNotFound();
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);
    if (!findRoom) throw RoomException.roomNotFound();
    //방안에 유저가 있는 경우 에러띄움
    // if (findRoom.nowHeadcount) throw RoomException.roomUserexists();
    if (userId != findRoom.ownerId) throw UserException.userUnauthorized();
    const deleteResult = await this.roomRepository.deleteRoom(uuid);
    if (!deleteResult) throw RoomException.roomDeleteError();
    return true;
  }

  async deleteRoomFromSocket(uuid: string): Promise<boolean> {
    const deleteResult = await this.roomRepository.deleteRoom(uuid);
    if (!deleteResult) throw RoomException.roomDeleteError();
    return true;
  }
  createTokenWithChannel(appID: string, uuid: string): string {
    const HOUR_TO_SECOND = 3600;
    const appCertificate: string = process.env.AGORA_APP_CERTIFICATE ?? '';
    const expirationTimeInSeconds = HOUR_TO_SECOND * 24;
    const role = RtcRole.PUBLISHER;
    const channel = uuid;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channel,
      0,
      role,
      expirationTimestamp,
    );
    //0는게 원래는 uid 자리인데 저거 그냥 똑같아도 이미 다른거에서 고유한 토큰값 나오니깐 0으로 함
  }

  timeStringToSeconds(timeString: string): number {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return totalSeconds;
  }

  async uploadRoomThumbnail(
    userId: number,
    file: Express.Multer.File,
  ): Promise<ThumbnailUploadResult> {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) {
      throw new BadRequestException('유저가 존재하지 않습니다');
    }

    const uploadedFile = await this.imageService.uploadImage(
      file,
      'room-thumbnails',
    );
    return {
      message: '썸네일이 성공적으로 업로드되었습니다',
      roomThumbnail: uploadedFile.Location,
    };
  }

  async generateAgoraToken(uuid: string): Promise<string> {
    const findRoom = await this.roomRepository.findRoomByUuid(uuid);
    if (!findRoom) throw RoomException.roomNotFound();

    const agoraAppId: string = process.env.AGORA_APP_ID ?? '';
    const aFreshToken = this.createTokenWithChannel(agoraAppId, uuid);

    const roomUpdateWithaFreshToken =
      await this.roomRepository.updateRoomByRefreshToken(aFreshToken, uuid);
    if (!roomUpdateWithaFreshToken) throw RoomException.roomTokenUpdateError();

    const token = roomUpdateWithaFreshToken.agoraToken;
    return token;
  }
  // async addRandomRoomToDatabase() {
  //   const ownerId = 1; // 이 값은 실제로 데이터베이스에 있는 사용자 ID여야 합니다.
  //   const randomRoom = createRandomRoom(ownerId);

  //   const createdRoom = await this.prisma.room.create({
  //     data: randomRoom,
  //   });

  //   console.log(createdRoom);
  // }
}
