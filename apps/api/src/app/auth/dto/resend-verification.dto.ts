import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResendVerificationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsEmail()
  email!: string;
}
