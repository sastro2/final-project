import crypto from 'node:crypto';
import Tokens from 'csrf';
import { createCsrfSalt, getCsrfSalt } from './database';

const tokens = new Tokens();

export async function generateCsrfToken() {
  const salt = crypto.randomBytes(64).toString('base64');

  const token = tokens.create(salt);

  const idSaltPair = await createCsrfSalt(salt);

  return {
    id: idSaltPair.id,
    token: token,
  };
}

export async function verifyCsrfToken(token: string, id: number) {
  const salt = await getCsrfSalt(id);

  return tokens.verify(salt.salt, token);
}
