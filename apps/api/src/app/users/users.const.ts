import { BadRequestException } from '@nestjs/common';

import { UserDocument, UserStatus } from './schemas';
import { UserPublic } from './user.model';

export const PASSWORD_REGEX =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const USERNAME_REGEX = /^([a-z0-9]|[-._](?![-._])).*$/;

export const validateUserStatusIsPending = (user: UserDocument): void => {
  if (user.status !== UserStatus.Pending) {
    throw new BadRequestException(
      'This account has already been activated. Please log in'
    );
  }
};

export const validateUserStatusIsActive = (user: UserDocument): void => {
  if (user.status !== UserStatus.Active) {
    throw new BadRequestException('This account has not yet activated');
  }
};

export const getUserPublic = (user: UserDocument): UserPublic => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  };
};
