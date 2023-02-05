import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSessionModel, AuthSessionSchema } from './schemas';

@Module({
  imports: [
    JwtModule,
    UsersModule,
    MongooseModule.forFeature([
      {
        name: AuthSessionModel.name,
        schema: AuthSessionSchema,
      },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
