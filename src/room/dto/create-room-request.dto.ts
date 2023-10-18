import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateRoomRequestDto {
  @IsOptional()
  @ApiProperty({
    description: '방제목',
    example: '새벽스터디',
    required: true,
  })
  readonly title: string;

  // @Min(1, { message: '방 최대인원은 1명 이상이어야 합니다.' })
  // @Max(8, { message: '방 최대인원은 8명 이내이어야 합니다.' })
  @IsOptional()
  @ApiProperty({
    description: '방 최대인원',
    example: 5,
    required: true,
  })
  readonly maxHeadcount: string;
  @IsOptional()
  @ApiProperty({
    description: '방 카테고리',
    example: 'study',
    required: true,
  })
  readonly category: string;

  @IsOptional()
  @ApiProperty({
    description: '방 유의사항',
    required: false,
  })
  readonly note: string;

  // @IsOptional()
  // @ApiProperty({
  //   description: '방 썸네일 이미지',
  //   required: false,
  // })
  // readonly roomThumbnail: string;
}
