import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateGoalTimeDto {
  @IsOptional({ message: '목표 시간이 비어있으면 안 됩니다.' })
  @IsInt()
  @ApiProperty({
    description: '학습 목표 시간 설정',
    example: 30,
    required: true,
  })
  studyGoalTime?: number;

  @IsOptional({ message: '목표 시간이 비어있으면 안 됩니다.' })
  @IsInt()
  @ApiProperty({
    description: '취미 목표 시간 설정',
    example: 30,
    required: true,
  })
  hobbyGoalTime?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '카테고리 설정',
    example: '학습',
    required: true,
  })
  readonly mainCategory?: string;
}
