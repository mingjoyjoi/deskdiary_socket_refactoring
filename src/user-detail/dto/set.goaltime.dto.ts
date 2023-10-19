import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SetGoalTimeDto {
  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: '학습 목표 시간 설정',
    example: 30,
    required: true,
  })
  readonly studyGoalTime?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: '취미 목표 시간 설정',
    example: 30,
    required: true,
  })
  readonly hobbyGoalTime?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '카테고리 설정',
    example: '학습',
    required: true,
  })
  readonly mainCategory?: string;
}
