import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthGuard, AuthModule } from './auth';
import { EmailModule } from './email';
import { EnvModule, EnvService, envValidate } from './env';
import { UsersModule } from './users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidate,
    }),
    EnvModule,
    EmailModule,
    MongooseModule.forRootAsync({
      useFactory: (envService: EnvService) => {
        return {
          uri: envService.mongodbURI,
        };
      },
      inject: [EnvService],
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
