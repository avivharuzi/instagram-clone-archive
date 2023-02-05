import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

import { UserDocument, UserModel } from '../../users';
import { getDefaultTokenExpiration } from '../tokens.const';

export type TokenDocument = HydratedDocument<TokenModel>;

export enum TokenType {
  UserVerification = 'userVerification',
  PasswordReset = 'passwordReset',
}

@Schema({
  collection: 'tokens',
})
export class TokenModel {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
  })
  user!: UserDocument;

  @Prop({
    type: String,
    required: true,
  })
  token!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TokenType),
  })
  type!: TokenType;

  @Prop({
    type: Date,
    required: true,
    default: getDefaultTokenExpiration(),
  })
  expiresAt!: Date;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);
