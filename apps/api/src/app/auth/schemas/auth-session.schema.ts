import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

import { UserDocument, UserModel } from '../../users';

export type AuthSessionDocument = HydratedDocument<AuthSessionModel>;

@Schema({
  collection: 'authSessions',
  timestamps: true,
})
export class AuthSessionModel {
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
  accessToken!: string;

  @Prop({
    type: String,
    required: true,
  })
  refreshToken!: string;

  @Prop({
    type: Date,
    required: true,
  })
  refreshTokenExpiresAt!: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSessionModel);
