import * as argon2 from 'argon2';

export const verifyPassword = async (
  hash: string,
  password: string
): Promise<boolean> => argon2.verify(hash, password);
