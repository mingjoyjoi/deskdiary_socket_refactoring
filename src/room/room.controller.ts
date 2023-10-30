import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

import { RoomService } from './room.service';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import {
  RoomResponseExample,
  RoomlistResponseExample,
  roomLeaveResponseExample,
} from './room.response.examples';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckoutRoomRequestDto } from './dto/checkout-room.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ImageService } from '../image/image.service';

@ApiTags('Room API')
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly imageService: ImageService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '방 목록 조회',
  })
  @ApiResponse({
    status: 200,
    description: '존재하는 방 목록의 정보(agoraToken 포함)를 조회합니다',
    content: {
      examples: RoomlistResponseExample,
    },
  })
  async getRoomList() {
    return await this.roomService.getRoomListAll();
  }

  @Post()
  @ApiOperation({ summary: '방 생성' })
  @ApiResponse({
    status: 201,
    description:
      '방 생성시 agoraToken토큰을 생성하며, 생성된 방의 정보(agoraToken 포함)와 방의 owner 정보를 함께 반환합니다.',
    content: {
      examples: RoomResponseExample,
    },
  })
  @Post()
  @ApiOperation({ summary: '방 생성' })
  @ApiResponse({
    status: 201,
    description: '방 생성 성공',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        maxHeadcount: { type: 'number' },
        category: { type: 'string' },
        note: { type: 'string' },
      },
    },
  })
  async createRoom(
    @Req() req: Request,
    @Body() createRoomRequestDto: CreateRoomRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('createRoom called');
    const userId = req.user['userId'];
    console.log(file);
    if (!file) {
      const roomThumbnail =
        'https://heavy-hips-s3.s3.ap-northeast-2.amazonaws.com/room-thumbnails/1697631199431-dog.jpeg';
      return await this.roomService.createRoom(
        createRoomRequestDto,
        userId,
        roomThumbnail,
      );
    }
    const s3Data = await this.imageService.uploadImage(file, 'room-thumbnails');
    const roomThumbnail = s3Data.Location;
    console.log(roomThumbnail);
    return await this.roomService.createRoom(
      createRoomRequestDto,
      userId,
      roomThumbnail,
    );
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'UUID로 방 조회',
    description: '방의 고유 UUID로 정보(agoratoken 포함)를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '방의 정보와 방의 owner 정보를 함께 반환합니다.',
    content: {
      examples: RoomResponseExample,
    },
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async getRoomByUUID(@Param('uuid') uuid: string) {
    return await this.roomService.getRoomByUUID(uuid);
  }

  @Post(':uuid/join')
  @ApiOperation({
    summary: '방 참여',
    description: '방에 성공적으로 참여했는지 여부를 boolean 값으로 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '방 참여자수, 방의 조회수를 1씩 증가 시킵니다.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async joinRoom(@Param('uuid') uuid: string): Promise<boolean> {
    return await this.roomService.joinRoom(uuid);
  }

  @Post(':uuid/leave')
  @ApiOperation({
    summary: '방 나가기',
    description:
      '방을 성공적으로 나갔는지에 대한 boolean값과 기록된 학습기록 데이터를 반환합니다. ',
  })
  @ApiResponse({
    status: 200,
    description:
      '방 참여자수를 1 감소시키고, 학습기록(체크인, 체크아웃시간, 타이머에 기록된 누적학습시간) 데이터를 성공적으로 저장함.',
    content: {
      examples: roomLeaveResponseExample,
    },
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async leaveRoom(
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Body() checkoutRoomRequestDto: CheckoutRoomRequestDto,
  ) {
    const userId = req.user['userId'];
    const resultLeaveRoom = await this.roomService.leaveRoom(uuid);
    const record = await this.roomService.checkoutRoom(
      checkoutRoomRequestDto,
      uuid,
      userId,
    );
    return {
      isLeaveRoom: resultLeaveRoom,
      record,
    };
  }

  @Delete(':uuid')
  @ApiOperation({
    summary: '방 삭제',
    description: '방을 성공적으로 삭제했는지 여부를 boolean 값으로 반환합니다.',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async deleteRoom(
    @Req() req: Request,
    @Param('uuid') uuid: string,
  ): Promise<boolean> {
    const userId = req.user['userId'];
    console.log(userId);
    return await this.roomService.deleteRoom(userId, uuid);
  }

  @Post('socket/leave/:uuid')
  @ApiOperation({ summary: '소켓 방 나가기' })
  async leaveRoomBySocket(
    @Req() req: Request,
    @Param('uuid') uuid: string,
  ): Promise<boolean> {
    const key = req.header('socket-secret-key');
    if (key === process.env.SOCKET_SECRET_KEY) {
      return await this.roomService.leaveRoom(uuid);
    }
    return false;
  }

  // @Delete('socket/:uuid')
  // @ApiOperation({ summary: '소켓 방 삭제' })
  // async deleteRoomBySocket(
  //   @Req() req: Request,
  //   @Param('uuid') uuid: string,
  // ): Promise<boolean> {
  //   const key = req.header('socket-secret-key');
  //   if (key === process.env.SOCKET_SECRET_KEY) {
  //     return await this.roomService.deleteRoomFromSocket(uuid);
  //   }
  //   return false;
  // }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: '방 썸네일 업로드' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: '방 썸네일 이미지',
  //   type: 'multipart/form-data',
  //   required: true,
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // @Post('image')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadThumbnail(
  //   @Req() req: { user: { userId: number } },
  //   @UploadedFile() image: Express.Multer.File,
  // ): Promise<{ message: string; roomThumbnail: string }> {
  //   const userId = req.user.userId;

  //   try {
  //     const uploadResult = await this.roomService.uploadRoomThumbnail(
  //       userId,
  //       image,
  //     );
  //     return {
  //       message: '썸네일이 성공적으로 업로드되었습니다.',
  //       roomThumbnail: uploadResult.roomThumbnail,
  //     };
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw error;
  //     } else {
  //       throw new HttpException(
  //         '썸네일 업로드 중 문제가 발생했습니다.',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }
  // }
}
