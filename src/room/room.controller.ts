import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { RoomResponseExample } from './room.response.examples';
@ApiTags('Room API')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: '방 생성' })
  @ApiResponse({
    status: 201,
    description: '생성된 방의 정보와 방의 owner 정보를 함께 반환합니다.',
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
  async createRoom(
    @Req() req: Request,
    @Body() createRoomRequestDto: CreateRoomRequestDto,
  ) {
    const userId = req.user['userId'];
    return await this.roomService.createRoom(createRoomRequestDto, userId);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'UUID로 방 조회',
    description: '방의 고유 UUID로 정보를 조회합니다.',
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
    return { result: await this.roomService.getRoomByUUID(uuid) };
  }

  @Post(':uuid/join')
  @ApiOperation({ summary: '방 참여' })
  @ApiResponse({
    status: 200,
    description: '방에 성공적으로 참여했는지 여부를 boolean 값으로 반환합니다.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async joinRoom(@Param('uuid') uuid: string): Promise<{ result: boolean }> {
    return { result: await this.roomService.joinRoom(uuid) };
  }

  @Post(':uuid/leave')
  @ApiOperation({ summary: '방 나가기' })
  @ApiResponse({
    status: 200,
    description: '방을 성공적으로 나갔는지에 대해 boolean값을 반환합니다.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer Token for authentication',
  })
  @UseGuards(JwtAuthGuard)
  async leaveRoom(@Param('uuid') uuid: string): Promise<{ result: boolean }> {
    return { result: await this.roomService.leaveRoom(uuid) };
  }

  @Delete(':uuid')
  @ApiOperation({ summary: '방 삭제' })
  @ApiResponse({
    status: 200,
    description: '방을 성공적으로 삭제했는지 여부를 boolean 값으로 반환합니다.',
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
  ): Promise<{ result: boolean }> {
    const userId = req.user['userId'];
    console.log(userId);
    return {
      result: await this.roomService.deleteRoom(userId, uuid),
    };
  }

  @Post('socket/leave/:uuid')
  @ApiOperation({ summary: '소켓 방 나가기' })
  async leaveRoomBySocket(
    @Req() req: Request,
    @Param('uuid') uuid: string,
  ): Promise<{ result: boolean }> {
    const key = req.header('socket-secret-key');
    if (key === process.env.SOCKET_SECRET_KEY) {
      return { result: await this.roomService.leaveRoom(uuid) };
    }
    return { result: false };
  }

  @Delete('socket/:uuid')
  @ApiOperation({ summary: '소켓 방 삭제' })
  async deleteRoomBySocket(
    @Req() req: Request,
    @Param('uuid') uuid: string,
  ): Promise<{ result: boolean }> {
    const key = req.header('socket-secret-key');
    if (key === process.env.SOCKET_SECRET_KEY) {
      return { result: await this.roomService.deleteRoomFromSocket(uuid) };
    }
    return { result: false };
  }
}
