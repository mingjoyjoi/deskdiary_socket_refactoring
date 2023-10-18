import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: '닉네임이 비어 있으면 안됩니다' })
  @ApiProperty({
    description: '닉네임',
    example: '수정된닉네임',
    required: true,
  })
  readonly nickname?: string;

  @IsNotEmpty({ message: '프로필 이미지 주소가 비어 있으면 안됩니다' })
  @ApiProperty({
    description: '프로필이미지',
    example: 'storige.com/asdf1234',
    required: true,
  })
  readonly profileImage?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '카테고리 설정',
    example: '학습',
    required: true,
  })
  readonly mainCategory?: string;
}
