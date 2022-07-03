import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import { createSerializedRegisterTokenCookie } from '../../../util/cookies';
import {
  createAccessToken,
  createProfileForUser,
  createRefreshToken,
  createSettingsForUser,
  createUser,
  getUserByUsername,
} from '../../../util/database';

type RegisterRequestBody = {
  username: string;
  password: string;
  csrfToken: string;
  csrfSaltId: number;
};

type RegisterNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: RegisterRequestBody;
};

export type RegisterResponseBody =
  | { errors: { message: string }[] }
  | { user: User };

export default async function registerHandler(
  request: RegisterNextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.username !== 'string' ||
      !request.body.username ||
      typeof request.body.password !== 'string' ||
      !request.body.password ||
      typeof request.body.csrfToken !== 'string' ||
      !request.body.csrfToken ||
      !request.body.csrfSaltId
    ) {
      response.status(400).json({
        errors: [
          {
            message: 'Username, password or CSRF token not provided',
          },
        ],
      });
      return;
    }

    const csrfTokenMatches = await verifyCsrfToken(
      request.body.csrfToken,
      request.body.csrfSaltId,
    );

    if (!csrfTokenMatches) {
      response.status(403).json({
        errors: [
          {
            message: 'Invalid CSRF token',
          },
        ],
      });
      return;
    }

    if (await getUserByUsername(request.body.username)) {
      response.status(409).json({
        errors: [
          {
            message: 'Username already taken',
          },
        ],
      });
      return;
    }

    const passwordHash = await bcrypt.hash(request.body.password, 12);
    const secret = crypto.randomBytes(64).toString('base64');
    const user = await createUser(request.body.username, passwordHash, secret);
    await createProfileForUser('user', 2, user.id.toString());
    await createSettingsForUser(user.id);

    const token = crypto.randomBytes(64).toString('base64');
    const accessToken = await createAccessToken(token, user.id);
    const aT = createSerializedRegisterTokenCookie(accessToken.token, 'access');

    const token2 = crypto.randomBytes(64).toString('base64');
    const refreshToken = await createRefreshToken(token2, user.id);
    const rT = createSerializedRegisterTokenCookie(
      refreshToken.token,
      'refresh',
    );

    if (aT && rT) {
      response
        .status(201)
        .setHeader('Set-Cookie', [aT, rT])
        .json({ user: user });
      return;
    }
  }

  response.status(405).json({
    errors: [
      {
        message: 'Method not supported, try POST instead',
      },
    ],
  });
}
