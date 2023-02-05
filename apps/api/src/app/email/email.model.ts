export enum EmailTemplateType {
  HTML = 'html',
  Subject = 'subject',
  Text = 'text',
}

export interface SendEmailOptions {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateContext {
  userVerification: UserVerificationEmailContext;
  passwordReset: PasswordResetEmailContext;
}

export interface UserVerificationEmailContext {
  username: string;
  link: string;
}

export interface PasswordResetEmailContext {
  username: string;
  link: string;
}
