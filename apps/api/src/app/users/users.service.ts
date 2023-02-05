import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from '../email';
import { EnvService } from '../env';
import { hashPassword } from '../shared';
import { TokensService, TokenType } from '../tokens';
import { CreateUserDto } from './dto';
import { UserDocument, UserModel, UserStatus } from './schemas';
import { validateUserStatusIsPending } from './users.const';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    private readonly tokensService: TokensService,
    private readonly emailService: EmailService,
    private readonly envService: EnvService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, username, password } = createUserDto;

    await this.validateUserEmail(email);
    await this.validateUserUsername(username);

    const passwordHashed = await hashPassword(password);

    const user = await this.userModel.create({
      username,
      email,
      password: passwordHashed,
    });

    const { token } = await this.tokensService.createToken(
      user.id,
      TokenType.UserVerification
    );

    await this.sendUserVerificationEmail(token, user);

    return user;
  }

  async verifyUser(token: string): Promise<void> {
    const tokenDetails = await this.tokensService.getTokenByTokenAndValidate(
      token,
      TokenType.UserVerification
    );

    const { user } = tokenDetails;

    if (user.status !== UserStatus.Pending) {
      await this.tokensService.deleteToken(tokenDetails.id);

      throw new BadRequestException(
        'This account has already been activated. Please log in'
      );
    }

    await this.userModel.findByIdAndUpdate(user.id, {
      status: UserStatus.Active,
    });

    await this.tokensService.deleteToken(tokenDetails.id);
  }

  async resendUserVerification(email: string): Promise<void> {
    const user = await this.getUserByEmailAndValidate(email);

    validateUserStatusIsPending(user);

    const tokenDetails =
      await this.tokensService.getTokenByUserIdAndCreateOrUpdateToken(
        user.id,
        TokenType.UserVerification
      );

    if (tokenDetails) {
      await this.sendUserVerificationEmail(tokenDetails.token, user);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.getUserByEmailAndValidate(email);

    validateUserStatusIsPending(user);

    const tokenDetails =
      await this.tokensService.getTokenByUserIdAndCreateOrUpdateToken(
        user.id,
        TokenType.PasswordReset
      );

    if (tokenDetails) {
      await this.sendPasswordResetEmail(tokenDetails.token, user);
    }
  }

  async checkResetPassword(token: string): Promise<void> {
    await this.tokensService.getTokenByTokenAndValidate(
      token,
      TokenType.PasswordReset
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenDetails = await this.tokensService.getTokenByTokenAndValidate(
      token,
      TokenType.PasswordReset
    );

    const { user } = tokenDetails;

    await this.updateUserPassword(user.id, password);
    await this.tokensService.deleteToken(tokenDetails.id);
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    const passwordHashed = await hashPassword(password);

    await this.userModel.findByIdAndUpdate(id, {
      password: passwordHashed,
    });
  }

  async getUserByEmailAndValidate(email: string): Promise<UserDocument> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException(
        'We were unable to find a account with that email'
      );
    }

    return user;
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email: email.trim().toLowerCase(),
      })
      .exec();
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        username: username.trim().toLowerCase(),
      })
      .exec();
  }

  private async validateUserEmail(email: string): Promise<void> {
    const userWithSameEmail = await this.getUserByEmail(email);

    if (userWithSameEmail) {
      throw new BadRequestException(
        'The email address you have entered is already associated with another account'
      );
    }
  }

  private async validateUserUsername(username: string): Promise<void> {
    const userWithSameUsername = await this.getUserByUsername(username);

    if (userWithSameUsername) {
      throw new BadRequestException(
        'The username you have entered is already associated with another account'
      );
    }
  }

  private async sendUserVerificationEmail(
    token: string,
    { email, username }: UserDocument
  ): Promise<void> {
    const link = `${this.envService.webBaseUrl}/auth/verify/${token}`;

    await this.emailService.send(email, 'userVerification', {
      username,
      link,
    });
  }

  private async sendPasswordResetEmail(
    token: string,
    { email, username }: UserDocument
  ): Promise<void> {
    const link = `${this.envService.webBaseUrl}/auth/reset-password/${token}`;

    await this.emailService.send(email, 'passwordReset', {
      username,
      link,
    });
  }
}
