import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenModel, TokenSchema } from './schemas';
import { TokensService } from './tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TokenModel.name,
        schema: TokenSchema,
      },
    ]),
  ],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
