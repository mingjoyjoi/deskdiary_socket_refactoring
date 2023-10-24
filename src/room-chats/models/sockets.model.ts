import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

const options: SchemaOptions = {
  id: false,
  collection: 'sockets',
  timestamps: true,
};

@Schema(options)
export class Socket extends Document {
  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  uuid: string;

  @Prop()
  @IsString()
  nickname: string;
}

export const SocketSchema = SchemaFactory.createForClass(Socket);
