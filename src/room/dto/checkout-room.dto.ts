import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CheckoutRoomRequestDto {
  @IsNotEmpty({ message: '방 체크인 시간이 필요합니다.' })
  @ApiProperty({
    description: '방 체크인 시간',
    example: '2023-10-16T14:00:00Z',
    required: true,
  })
  readonly checkIn: Date;

  @IsNotEmpty({ message: '방 체크아웃 시간이 필요합니다.' })
  @ApiProperty({
    description: '방 체크아웃 시간',
    example: '2023-10-16T16:30:00Z',
    required: true,
  })
  readonly checkOut: Date;

  @ApiProperty({
    description: '타이머에 기록된 학습 누적시간',
    example: '02:30:00',
    required: true,
  })
  @IsNotEmpty({ message: '학습 누적시간이 필요합니다.' })
  readonly totalHours: string;

  @ApiProperty({
    description: '참여한 방의 카테고리',
    example: '취미',
    required: true,
  })
  @IsNotEmpty({ message: '스터디룸, 취미룸 중 어떤 타입인지 필요합니다.' })
  readonly historyType: string;
}
