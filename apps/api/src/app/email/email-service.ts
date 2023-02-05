import { Injectable } from '@nestjs/common';
import * as changeCase from 'change-case';
import * as nodemailer from 'nodemailer';

import { EnvService } from '../env';
import {
  getEmailTemplateContent,
  getEmailTemplateFilePath,
} from './email.const';
import {
  EmailTemplateContext,
  EmailTemplateType,
  SendEmailOptions,
} from './email.model';

@Injectable()
export class EmailService {
  constructor(private readonly envService: EnvService) {}

  async send<T extends keyof EmailTemplateContext>(
    to: string,
    template: T,
    params: EmailTemplateContext[T]
  ): Promise<void> {
    return this.sendEmailWithTemplate(
      to,
      changeCase.paramCase(template),
      params
    );
  }

  private async sendEmailWithTemplate<T>(
    to: string,
    templateName: string,
    context: T
  ): Promise<void> {
    const filePaths = [
      `${getEmailTemplateFilePath(templateName, EmailTemplateType.Subject)}`,
      `${getEmailTemplateFilePath(templateName, EmailTemplateType.HTML)}`,
      `${getEmailTemplateFilePath(templateName, EmailTemplateType.Text)}`,
    ];

    const getEmailTemplateContentPromises = filePaths.map((filePath) =>
      getEmailTemplateContent<T>(filePath, context)
    ) as [Promise<string>, Promise<string>, Promise<string>];

    const [subject, html, text] = await Promise.all(
      getEmailTemplateContentPromises
    );

    return this.sendEmail(to, { subject, html, text });
  }

  private async sendEmail(
    to: string,
    { subject, html, text }: SendEmailOptions
  ): Promise<void> {
    const {
      smtpHost: host,
      smtpPort: port,
      smtpUser: user,
      smtpPass: pass,
      smtpFrom: from,
    } = this.envService;

    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
      secure: port === 465,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const options = {
      from,
      to,
      subject,
      html,
      text,
    };

    await transporter.sendMail(options);
  }
}
