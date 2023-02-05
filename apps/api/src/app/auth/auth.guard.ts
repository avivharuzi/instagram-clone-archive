import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { EnvService } from '../env';
import { UserDocument, UsersService } from '../users';
import {
  AUTH_COOKIE_ACCESS_TOKEN,
  AUTH_COOKIE_REFRESH_TOKEN,
  IS_PUBLIC_KEY,
  IS_WITHOUT_AUTH,
} from './auth.const';
import { AuthJWTPayload } from './auth.model';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly envService: EnvService,

    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const user = await this.tryToExtractUser(context);

    const withoutAuth = this.reflector.getAllAndOverride<boolean>(
      IS_WITHOUT_AUTH,
      [context.getHandler(), context.getClass()]
    );

    if (withoutAuth && user) {
      throw new ForbiddenException();
    }

    if (withoutAuth) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const req: FastifyRequest = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = user;

    return true;
  }

  private async tryToExtractUser(
    context: ExecutionContext
  ): Promise<UserDocument | null> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const res: FastifyReply = context.switchToHttp().getResponse();
    const accessToken = req.cookies[AUTH_COOKIE_ACCESS_TOKEN];

    // Check if we have access token.
    if (!accessToken) {
      return null;
    }

    let payload: AuthJWTPayload | null = null;

    try {
      payload = await this.jwtService.verifyAsync<AuthJWTPayload>(accessToken, {
        secret: this.envService.jwtSecret,
      });
    } catch (error) {
      // JWT is expired.
    }

    let userId = '';

    if (payload) {
      userId = payload.sub;
    } else {
      const refreshToken = req.cookies[AUTH_COOKIE_REFRESH_TOKEN];

      // Check if we have refresh token.
      if (!refreshToken) {
        return null;
      }

      const newAccessToken = await this.authService.tryToCreateNewAccessToken({
        accessToken,
        refreshToken,
      });

      // If we don't have new accessToken clear cookies.
      if (!newAccessToken) {
        res.clearCookie(AUTH_COOKIE_ACCESS_TOKEN);
        res.clearCookie(AUTH_COOKIE_REFRESH_TOKEN);

        return null;
      }

      // Assign the new accessToken.
      res.setCookie(AUTH_COOKIE_ACCESS_TOKEN, newAccessToken.accessToken);
      // eslint-disable-next-line prefer-destructuring
      userId = newAccessToken.userId;
    }

    // Try to extract user from database.
    try {
      return this.usersService.getUserById(userId);
    } catch (error) {
      return null;
    }
  }
}
