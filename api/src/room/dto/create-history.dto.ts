import { CheckoutRoomRequestDto } from './checkout-room.dto';

export class CreateHistoryDto extends CheckoutRoomRequestDto {
  readonly RoomId: number;

  readonly UserId: number;
}
