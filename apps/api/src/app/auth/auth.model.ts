import { BadRequestException } from '@nestjs/common';

export interface AuthJWTPayload {
  sub: string;
}

export interface AuthLoginTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthLoginException extends BadRequestException {
  constructor() {
    super('The email or password you have entered is invalid');
  }
}
