import * as fs from 'node:fs';
import * as path from 'node:path';

import handlebars from 'handlebars';

import { EmailTemplateType } from './email.model';

export const EMAIL_TEMPLATES_PATH = path.join(
  __dirname,
  'assets',
  'email-templates'
);

export const getEmailTemplateFilePath = (
  templateName: string,
  type: EmailTemplateType
): string => path.join(EMAIL_TEMPLATES_PATH, templateName, `${type}.hbs`);

export const getEmailTemplateContent = async <T>(
  filePath: string,
  context: T
): Promise<string> => {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const template = handlebars.compile(content);

  return template(context);
};
