import * as argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> =>
  argon2.hash(password);
