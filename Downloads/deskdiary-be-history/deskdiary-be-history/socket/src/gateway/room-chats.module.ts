import { Module } from '@nestjs/common';
import { SocketSchema, Socket as SocketModel } from '../models/sockets.model';
import { Room, RoomSchema } from '../models/rooms.model';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomchatsService } from './room-chats.service';
import { RoomchatsGateway } from './room-chats.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: SocketModel.name, schema: SocketSchema },
    ]),
  ],
  providers: [RoomchatsService, RoomchatsGateway],
})
export class RoomchatsModule {}
