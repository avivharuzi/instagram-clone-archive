import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import { PASSWORD_REGEX, USERNAME_REGEX } from '../users.const';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  @Matches(USERNAME_REGEX)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(PASSWORD_REGEX)
  password!: string;
}
