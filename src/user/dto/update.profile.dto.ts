import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: '닉네임이 비어 있으면 안됩니다' })
  @MinLength(2)
  @MaxLength(5)
  @ApiProperty({
    description: '닉네임',
    example: '수정된닉네임',
    required: true,
  })
  readonly nickname?: string;
}
