import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import { createSerializedRegisterTokenCookie } from '../../../util/cookies';
import {
  createAccessToken,
  createRefreshToken,
  getUserWithPasswordHashByUsername,
} from '../../../util/database';

type LoginRequestBody = {
  username: string;
  password: string;
  csrfToken: string;
  csrfSaltId: number;
};

type LoginNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: LoginRequestBody;
};

export type LoginResponseBody =
  | { errors: { message: string }[] }
  | { user: Pick<User, 'id'> };

export default async function loginHandler(
  request: LoginNextApiRequest,
  response: NextApiResponse<LoginResponseBody>,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.username !== 'string' ||
      !request.body.username ||
      typeof request.body.password !== 'string' ||
      !request.body.password ||
      typeof request.body.csrfToken !== 'string' ||
      !request.body.csrfToken
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

    const userWithPasswordHash = await getUserWithPasswordHashByUsername(
      request.body.username,
    );

    if (!userWithPasswordHash) {
      response.status(401).json({
        errors: [
          {
            message: 'Username or password does not match',
          },
        ],
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      request.body.password,
      userWithPasswordHash.passwordHash,
    );

    if (!passwordMatches) {
      response.status(401).json({
        errors: [
          {
            message: 'Username or password does not match',
          },
        ],
      });
      return;
    }

    const token = crypto.randomBytes(64).toString('base64');
    const accessToken = await createAccessToken(token, userWithPasswordHash.id);
    const aT = createSerializedRegisterTokenCookie(accessToken.token, 'access');

    const token2 = crypto.randomBytes(64).toString('base64');
    const refreshToken = await createRefreshToken(
      token2,
      userWithPasswordHash.id,
    );
    const rT = createSerializedRegisterTokenCookie(
      refreshToken.token,
      'refresh',
    );

    if (aT && rT) {
      response
        .status(201)
        .setHeader('Set-Cookie', [aT, rT])
        .json({
          user: {
            id: userWithPasswordHash.id,
          },
        });
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
