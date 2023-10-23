import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

const options: SchemaOptions = {
  collection: 'rooms',
  timestamps: true,
};

@Schema(options)
export class Room extends Document {
  @Prop()
  @IsNotEmpty()
  userList: object;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  uuid: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  owner: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
