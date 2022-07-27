import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { createSerializedRegisterTokenCookie } from '../../../util/cookies';
import {
  createAccessToken,
  createRefreshToken,
  get2faDataByUserId,
  getUserWithPasswordHashByUsername,
  set2FaTimeoutForUserById,
} from '../../../util/database';
import { unixTimeFromDate } from '../../../util/methods/pages/utils/convertDateToUnixTime';

type TotpRequestBody = {
  userId: number;
  username: string;
  password: string;
  currentDate: Date;
  passwordInput: number;
};

type TotpNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: TotpRequestBody;
};

const generateSessionTokens = async (
  userWithPasswordHash: UserWithPasswordHash,
): Promise<{ aT: string; rT: string } | null> => {
  const token = crypto.randomBytes(64).toString('base64');
  const accessToken = await createAccessToken(token, userWithPasswordHash.id);
  const aT = createSerializedRegisterTokenCookie(accessToken.token, 'access');

  const token2 = crypto.randomBytes(64).toString('base64');
  const refreshToken = await createRefreshToken(
    token2,
    userWithPasswordHash.id,
  );
  const rT = createSerializedRegisterTokenCookie(refreshToken.token, 'refresh');

  if (aT && rT) {
    return { aT: aT, rT: rT };
  }

  return null;
};

export default async function TotpHandler(
  request: TotpNextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
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

    if (passwordMatches) {
      const currentTimeInUnix = unixTimeFromDate(request.body.currentDate);

      const user2FaData = await get2faDataByUserId(request.body.userId);

      if (user2FaData) {
        const totpResponse = await fetch(
          'https://sastro-password.herokuapp.com/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              twoFaSecret: user2FaData.twofaSecret,
              twoFaUnixT0: user2FaData.twofaUnixT0,
              currentTimeInUnix: currentTimeInUnix,
              asNumberArray: false,
              applicationPassword: 'KaPdSgVkYp3s6v9y$B&E)H@MbQeThWmZ',
            }),
          },
        );

        const totpResponseBody =
          (await totpResponse.json()) as TotpResponseBody;

        if ('password' in totpResponseBody) {
          if (totpResponseBody.password === request.body.passwordInput) {
            const tokens = await generateSessionTokens(userWithPasswordHash);
            if (tokens) {
              response
                .status(202)
                .setHeader('Set-Cookie', [tokens.aT, tokens.rT])
                .json({
                  passwordMatches: true,
                });
              return;
            }
            response.status(500).json({
              errors: [
                {
                  message: 'Cookie creation failed',
                },
              ],
            });
            return;
          }
        }

        if ('errors' in totpResponseBody) {
          response.status(500).json(totpResponseBody.errors);
          return;
        }

        const previousTotpResponse = await fetch(
          'https://sastro-password.herokuapp.com/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              twoFaSecret: user2FaData.twofaSecret,
              twoFaUnixT0: user2FaData.twofaUnixT0,
              currentTimeInUnix: currentTimeInUnix - 30,
              asNumberArray: false,
              applicationPassword: 'KaPdSgVkYp3s6v9y$B&E)H@MbQeThWmZ',
            }),
          },
        );

        const previousTotpResponseBody =
          (await previousTotpResponse.json()) as TotpResponseBody;

        if ('password' in previousTotpResponseBody) {
          if (
            previousTotpResponseBody.password === request.body.passwordInput
          ) {
            const tokens = await generateSessionTokens(userWithPasswordHash);
            if (tokens) {
              response
                .status(202)
                .setHeader('Set-Cookie', [tokens.aT, tokens.rT])
                .json({
                  passwordMatches: true,
                });
              return;
            }
            response.status(500).json({
              errors: [
                {
                  message: 'Cookie creation failed',
                },
              ],
            });
            return;
          }
        }

        if ('errors' in previousTotpResponseBody) {
          response.status(500).json(previousTotpResponseBody.errors);
          return;
        }

        const nextTotpResponse = await fetch(
          'https://sastro-password.herokuapp.com/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              twoFaSecret: user2FaData.twofaSecret,
              twoFaUnixT0: user2FaData.twofaUnixT0,
              currentTimeInUnix: currentTimeInUnix + 30,
              asNumberArray: false,
              applicationPassword: 'KaPdSgVkYp3s6v9y$B&E)H@MbQeThWmZ',
            }),
          },
        );

        const nextTotpResponseBody =
          (await nextTotpResponse.json()) as TotpResponseBody;

        if ('password' in nextTotpResponseBody) {
          if (nextTotpResponseBody.password === request.body.passwordInput) {
            const tokens = await generateSessionTokens(userWithPasswordHash);
            if (tokens) {
              response
                .status(202)
                .setHeader('Set-Cookie', [tokens.aT, tokens.rT])
                .json({
                  passwordMatches: true,
                });
              return;
            }
            response.status(500).json({
              errors: [
                {
                  message: 'Cookie creation failed',
                },
              ],
            });
            return;
          }

          await set2FaTimeoutForUserById(
            request.body.userId,
            currentTimeInUnix + 30,
          );

          response.status(401).json({
            passwordMatches: false,
          });
          return;
        }

        if ('errors' in nextTotpResponseBody) {
          response.status(500).json(nextTotpResponseBody.errors);
          return;
        }
      }
    }

    response.status(401).json({
      errors: [
        {
          message: 'Username or password doesnt match',
        },
      ],
    });
    return;
  }

  response.status(403).json({
    errors: [
      {
        message: 'Method not accepted try POST',
      },
    ],
  });
}
