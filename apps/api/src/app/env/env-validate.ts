import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';

import { Env, NodeEnv } from './env.model';

class EnvVariables implements Env {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsString()
  @IsNotEmpty()
  API_HOST!: string;

  @IsNumber()
  @IsPositive()
  API_PORT!: number;

  @IsString()
  @IsNotEmpty()
  API_GLOBAL_PREFIX!: string;

  @IsString()
  @IsNotEmpty()
  API_COOKIE_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  API_MONGODB_URI!: string;

  @IsString()
  @IsNotEmpty()
  API_JWT_SECRET!: string;

  @IsNumber()
  @IsPositive()
  API_ACCESS_TOKEN_EXPIRES_IN!: number;

  @IsNumber()
  @IsPositive()
  API_REFRESH_TOKEN_EXPIRES_IN!: number;

  @IsString()
  @IsNotEmpty()
  API_SMTP_HOST!: string;

  @IsNumber()
  @IsPositive()
  API_SMTP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  API_SMTP_USER!: string;

  @IsString()
  @IsNotEmpty()
  API_SMTP_PASS!: string;

  @IsString()
  @IsNotEmpty()
  API_SMTP_FROM!: string;

  @IsString()
  @IsNotEmpty()
  API_WEB_BASE_URL!: string;
}

export const envValidate = (config: Record<string, unknown>): EnvVariables => {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
