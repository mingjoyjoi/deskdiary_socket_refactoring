import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateGoalTimeDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: '목표 시간 수정',
    example: 30,
    required: true,
  })
  readonly goalTime: number;
}
