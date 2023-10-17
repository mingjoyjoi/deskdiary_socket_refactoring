import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class JoinUserDto {
  @IsEmail(
    {},
    {
      message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.',
    },
  )
  @IsNotEmpty({ message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @ApiProperty({
    description: '사용자의 이메일 주소',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @IsString({ message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @IsNotEmpty({ message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @Matches(/^[a-zA-Z0-9\uAC00-\uD7A3]*$/, {
    message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.',
  })
  @ApiProperty({
    description: '사용자의 닉네임',
    example: '무거운엉덩이123abc',
    required: true,
  })
  nickname: string;

  @IsString({ message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @IsNotEmpty({ message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @MinLength(8, { message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: '이메일 혹은 비밀번호를 다시 한 번 확인해 주세요.',
    },
  )
  @ApiProperty({
    description: '사용자의 비밀번호',
    example: 'Password12!',
    required: true,
  })
  password: string;
}
