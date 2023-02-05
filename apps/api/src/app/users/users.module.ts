import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokensModule } from '../tokens';
import {
  UserFollowModel,
  UserFollowSchema,
  UserModel,
  UserSchema,
} from './schemas';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
      {
        name: UserFollowModel.name,
        schema: UserFollowSchema,
      },
    ]),
    TokensModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
