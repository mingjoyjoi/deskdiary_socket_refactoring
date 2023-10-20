import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  IsOptional,
  Min,
  IsString,
} from 'class-validator';

export class UpdateMainCategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '카테고리 설정',
    example: '학습',
    required: true,
  })
  readonly mainCategory: String;
}