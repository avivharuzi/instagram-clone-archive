import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

export enum UserStatus {
  Pending = 'pending',
  Active = 'active',
}

export enum UserRole {
  User = 'user',
}

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserModel {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  username!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    type: String,
  })
  password!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserStatus),
    default: UserStatus.Pending,
  })
  status!: UserStatus;

  @Prop({
    type: [String],
    required: true,
    enum: Object.values(UserRole),
    default: [UserRole.User],
  })
  roles!: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
