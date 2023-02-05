export enum NodeEnv {
  Development = 'development',
  Production = 'production',
}

export interface Env {
  NODE_ENV: NodeEnv;
  API_HOST: string;
  API_PORT: number;
  API_GLOBAL_PREFIX: string;
  API_COOKIE_SECRET: string;
  API_MONGODB_URI: string;
  API_JWT_SECRET: string;
  API_ACCESS_TOKEN_EXPIRES_IN: number;
  API_REFRESH_TOKEN_EXPIRES_IN: number;
  API_SMTP_HOST: string;
  API_SMTP_PORT: number;
  API_SMTP_USER: string;
  API_SMTP_PASS: string;
  API_SMTP_FROM: string;
  API_WEB_BASE_URL: string;
}
