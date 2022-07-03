import crypto from 'node:crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import { createSerializedRegisterTokenCookie } from '../../../util/cookies';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshToken,
  setRefreshTokenToUsed,
} from '../../../util/database';

type RefreshAccessRequestBody = {
  refreshToken: string;
  csrfToken: string;
  csrfSaltId: number;
  userId: number;
};

type RefreshAccessNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: RefreshAccessRequestBody;
};

export type RefreshAccessResponseBody =
  | { errors: { message: string }[] }
  | { reusedRefreshToken: boolean }
  | {
      cookies: {
        aT: string;
        rT: string;
      };
    };

export default async function refreshAccessHandler(
  request: RefreshAccessNextApiRequest,
  response: NextApiResponse<RefreshAccessResponseBody>,
) {
  if (request.method === 'POST') {
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

    const token = await getRefreshToken(request.body.refreshToken);

    if (!token || token.userId !== request.body.userId) {
      response.status(403).json({
        errors: [
          {
            message: 'Refresh token invalid or expired',
          },
        ],
      });
      return;
    }

    if (token.wasUsed) {
      const serializedCookie = createSerializedRegisterTokenCookie(
        crypto.randomBytes(64).toString('base64'),
        'refresh',
        { expired: true },
      );

      response.status(401).setHeader('Set-Cookie', serializedCookie!).json({
        reusedRefreshToken: true,
      });
      return;
    }

    const newAccessToken = crypto.randomBytes(64).toString('base64');
    const accessToken = await createAccessToken(
      newAccessToken,
      request.body.userId,
    );
    const aT = createSerializedRegisterTokenCookie(accessToken.token, 'access');

    const newRefreshToken = crypto.randomBytes(64).toString('base64');
    const refreshToken = await createRefreshToken(
      newRefreshToken,
      request.body.userId,
    );
    const rT = createSerializedRegisterTokenCookie(
      refreshToken.token,
      'refresh',
    );

    await setRefreshTokenToUsed(request.body.refreshToken);

    if (aT && rT) {
      response.status(201).json({
        cookies: {
          aT,
          rT,
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
