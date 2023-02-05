import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Model } from 'mongoose';

import { EnvService } from '../env';
import { generateRandomToken, isDateExpired, verifyPassword } from '../shared';
import {
  getUserPublic,
  UserDocument,
  UserPublic,
  UsersService,
  validateUserStatusIsActive,
} from '../users';
import {
  AUTH_COOKIE_ACCESS_TOKEN,
  AUTH_COOKIE_REFRESH_TOKEN,
} from './auth.const';
import {
  AuthJWTPayload,
  AuthLoginException,
  AuthLoginTokens,
} from './auth.model';
import {
  ForgotPasswordDto,
  LoginDto,
  ResendVerificationDto,
  ResetPasswordDto,
  SignupDto,
} from './dto';
import { AuthSessionDocument, AuthSessionModel } from './schemas';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly envService: EnvService,
    @InjectModel(AuthSessionModel.name)
    private readonly authSessionModel: Model<AuthSessionDocument>
  ) {}

  async logout(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const accessToken = req.cookies[AUTH_COOKIE_ACCESS_TOKEN];
    const refreshToken = req.cookies[AUTH_COOKIE_REFRESH_TOKEN];

    await this.authSessionModel.deleteOne({
      accessToken,
      $or: [
        {
          refreshToken,
        },
      ],
    });

    res.clearCookie(AUTH_COOKIE_ACCESS_TOKEN);
    res.clearCookie(AUTH_COOKIE_REFRESH_TOKEN);
  }

  async signup(signupDto: SignupDto): Promise<void> {
    await this.usersService.createUser(signupDto);
  }

  async resendVerification({ email }: ResendVerificationDto): Promise<void> {
    await this.usersService.resendUserVerification(email);
  }

  async verify(token: string): Promise<void> {
    await this.usersService.verifyUser(token);
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    await this.usersService.forgotPassword(email);
  }

  async checkResetPassword(token: string): Promise<void> {
    await this.usersService.checkResetPassword(token);
  }

  async resetPassword(
    token: string,
    { password }: ResetPasswordDto
  ): Promise<void> {
    await this.usersService.resetPassword(token, password);
  }

  async login(res: FastifyReply, loginDto: LoginDto): Promise<UserPublic> {
    const { email, password } = loginDto;
    // Check if we have user match with the email.
    const userWithSameEmail = await this.usersService.getUserByEmail(email);

    if (!userWithSameEmail) {
      throw new AuthLoginException();
    }

    // Check user has password match.
    const hasPasswordMatch = await verifyPassword(
      userWithSameEmail.password,
      password
    );

    if (!hasPasswordMatch) {
      throw new AuthLoginException();
    }

    // Check user is active.
    validateUserStatusIsActive(userWithSameEmail);

    // Create tokens and store in database.
    const { accessToken, refreshToken } = await this.createLoginTokens(
      userWithSameEmail
    );

    // Attach tokens to cookies.
    res.setCookie(AUTH_COOKIE_ACCESS_TOKEN, accessToken);
    res.setCookie(AUTH_COOKIE_REFRESH_TOKEN, refreshToken);

    return getUserPublic(userWithSameEmail);
  }

  async tryToCreateNewAccessToken(tokens: AuthLoginTokens): Promise<{
    userId: string;
    accessToken: string;
  } | null> {
    const authSession = await this.authSessionModel
      .findOne({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
      .populate('user');

    if (!authSession) {
      return null;
    }

    // Check if refreshToken is expired.
    if (isDateExpired(authSession.refreshTokenExpiresAt)) {
      // Delete auth session.
      await this.authSessionModel.findByIdAndDelete(authSession.id);

      return null;
    }

    const accessToken = await this.createAccessToken(authSession.user);

    await this.authSessionModel.findByIdAndUpdate(authSession.id, {
      $set: {
        accessToken,
      },
    });

    return {
      userId: authSession.user.id,
      accessToken,
    };
  }

  private async createLoginTokens(
    user: UserDocument
  ): Promise<AuthLoginTokens> {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await generateRandomToken();

    const refreshTokenExpiresAt = new Date(
      Date.now() + this.envService.refreshTokenExpiresIn * 1000
    );

    await this.authSessionModel.create({
      user: user.id,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createAccessToken(user: UserDocument): Promise<string> {
    const payload: AuthJWTPayload = {
      sub: user.id,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.envService.accessTokenExpiresIn,
      secret: this.envService.jwtSecret,
    });
  }
}
