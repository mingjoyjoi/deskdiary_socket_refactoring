import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '사용자의 현재 비밀번호',
    example: 'Password12!',
    required: true,
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호가 비어 있으면 안됩니다' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다',
    },
  )
  @ApiProperty({
    description: '사용자의 새로운 비밀번호',
    example: 'newPassword12!',
    required: true,
  })
  readonly newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) => {
    return obj.newPassword === value ? value : null;
  })
  @ApiProperty({
    description: '사용자의 새로운 비밀번호 확인',
    example: 'Password12!',
    required: true,
  })
  readonly confirmNewPassword: string;
}
