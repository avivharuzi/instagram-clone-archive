import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { generateRandomToken, isDateExpired } from '../shared';
import { TokenDocument, TokenModel, TokenType } from './schemas';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(TokenModel.name)
    private readonly tokenModel: Model<TokenDocument>
  ) {}

  async createToken(userId: string, type: TokenType): Promise<TokenDocument> {
    const token = await generateRandomToken();

    return this.tokenModel.create({
      user: userId,
      token,
      type,
    });
  }

  async updateToken(id: string): Promise<TokenDocument | null> {
    const token = await generateRandomToken();

    return this.tokenModel
      .findByIdAndUpdate(
        id,
        {
          token,
        },
        { new: true }
      )
      .populate('user');
  }

  async getTokenByType(
    token: string,
    type: TokenType
  ): Promise<TokenDocument | null> {
    return this.tokenModel
      .findOne({
        token,
        type,
      })
      .populate('user');
  }

  async getTokenByTokenAndValidate(
    token: string,
    type: TokenType
  ): Promise<TokenDocument> {
    const details = await this.getTokenByType(token, type);

    if (!details || isDateExpired(details.expiresAt)) {
      throw new BadRequestException(
        'We were unable to find a valid token. Your token my have expired.'
      );
    }

    return details;
  }

  async getTokenByUserId(
    userId: string,
    type: TokenType
  ): Promise<TokenDocument | null> {
    return this.tokenModel
      .findOne({
        user: userId,
        type,
      })
      .populate('user');
  }

  async getTokenByUserIdAndCreateOrUpdateToken(
    userId: string,
    type: TokenType
  ): Promise<TokenDocument | null> {
    const details = await this.getTokenByUserId(userId, type);

    if (!details) {
      return this.createToken(userId, TokenType.PasswordReset);
    }

    return this.updateToken(details.id);
  }

  async deleteToken(id: string): Promise<void> {
    await this.tokenModel.findByIdAndDelete(id);
  }

  async deleteTokenByToken(token: string, type: TokenType): Promise<void> {
    await this.tokenModel.findOneAndDelete({
      token,
      type,
    });
  }
}
