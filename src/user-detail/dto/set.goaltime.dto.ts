import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SetGoalTimeDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
<<<<<<< HEAD
    description: '취미 목표 시간 설정',
    example: 30,
    required: true,
  })
  readonly GoalTime?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '카테고리 설정',
    example: '학습',
    required: true,
  })
  readonly mainCategory?: string;
=======
    description: '목표 시간 설정',
    example: 30,
    required: true,
  })
  readonly goalTime: number;
>>>>>>> 660a31bd03cd1c6a16126d7a5ca6bb2d53bf3191
}
