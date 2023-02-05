import * as crypto from 'node:crypto';

export const generateRandomToken = async (length = 128): Promise<string> =>
  new Promise((resolve, reject) => {
    const size = length / 2;

    crypto.randomBytes(size, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
