import { PickType } from '@nestjs/swagger';
import { JoinUserDto } from './join.user.dto';

export class LoginUserDto extends PickType(JoinUserDto, [
  'email',
  'password',
] as const) {}
