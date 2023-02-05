import {
  createParamDecorator,
  CustomDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

import { UserDocument } from '../users';

export const AUTH_COOKIE_ACCESS_TOKEN = 'X-ACCESS-TOKEN';

export const AUTH_COOKIE_REFRESH_TOKEN = 'X-REFRESH-TOKEN';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);

export const IS_WITHOUT_AUTH = 'noAuth';

export const WithoutAuth = (): CustomDecorator<string> =>
  SetMetadata(IS_WITHOUT_AUTH, true);

export const User = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as UserDocument;
  }
);
