import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env, NodeEnv } from './env.model';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<Env>) {}

  get nodeEnv(): NodeEnv {
    return this.getValue('NODE_ENV');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === NodeEnv.Development;
  }

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }

  get host(): string {
    return this.getValue('API_HOST');
  }

  get port(): number {
    return this.getValue('API_PORT');
  }

  get globalPrefix(): string {
    return this.getValue('API_GLOBAL_PREFIX');
  }

  get cookieSecret(): string {
    return this.getValue('API_COOKIE_SECRET');
  }

  get mongodbURI(): string {
    return this.getValue('API_MONGODB_URI');
  }

  get jwtSecret(): string {
    return this.getValue('API_JWT_SECRET');
  }

  get accessTokenExpiresIn(): number {
    return this.getValue('API_ACCESS_TOKEN_EXPIRES_IN');
  }

  get refreshTokenExpiresIn(): number {
    return this.getValue('API_REFRESH_TOKEN_EXPIRES_IN');
  }

  get smtpHost(): string {
    return this.getValue('API_SMTP_HOST');
  }

  get smtpPort(): number {
    return this.getValue('API_SMTP_PORT');
  }

  get smtpUser(): string {
    return this.getValue('API_SMTP_USER');
  }

  get smtpPass(): string {
    return this.getValue('API_SMTP_PASS');
  }

  get smtpFrom(): string {
    return this.getValue('API_SMTP_FROM');
  }

  get webBaseUrl(): string {
    return this.getValue('API_WEB_BASE_URL');
  }

  private getValue<T>(key: keyof Env): T {
    return this.configService.get<T>(key, {
      infer: true,
    }) as T;
  }
}
