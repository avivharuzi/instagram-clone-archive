import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

import { UserDocument, UserModel } from './user.schema';

export type UserFollowDocument = HydratedDocument<UserFollowModel>;

@Schema({
  collection: 'usersFollows',
})
export class UserFollowModel {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
  })
  follower!: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
  })
  following!: UserDocument;
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollowModel);
