import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import forge from 'node-forge';
import { createSerializedRegisterTokenCookie } from '../../../util/cookies';
import {
  createAccessToken,
  createRefreshToken,
  get2faDataByUserId,
  getUserWithPasswordHashByUsername,
  set2FaTimeoutForUserById,
} from '../../../util/database';
import { unixTimeFromDate } from '../../../util/sharedMethods/convertDateToUnixTime';

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

const generatePassword = (
  twofaSecret: string,
  twofaUnixT0: number,
  currentTimeInUnix: number,
): number => {
  const md = forge.hmac.create();

  const currentTimeStep = Math.floor((twofaUnixT0 - currentTimeInUnix) / 30);
  const currentTimeStep8Bit = currentTimeStep.toString(2).padStart(8, '0');

  md.start('sha1', twofaSecret);
  md.update(currentTimeStep8Bit);
  const hmacDigest = md.digest();

  console.log(hmacDigest.toHex());

  const hmacDigestCharArray = hmacDigest.toHex().split('');

  const hmacDigestHexArray: string[] = [];
  for (let i = 0; i < hmacDigestCharArray.length; i += 2) {
    let tmpHex: string = '';

    tmpHex = hmacDigestCharArray[i] + hmacDigestCharArray[i + 1];

    hmacDigestHexArray.push(tmpHex);
  }

  console.log(hmacDigestHexArray);

  const hmacDigestBinaryArray: string[] = [];
  for (let i = 0; i < hmacDigestHexArray.length; i++) {
    hmacDigestBinaryArray.push(
      parseInt(hmacDigestHexArray[i], 16).toString(2).padStart(8, '0'),
    );
  }

  console.log(hmacDigestBinaryArray);

  const offset = parseInt(hmacDigestBinaryArray[19].slice(4), 2);

  let interceptedBits: string = '';
  for (let i = offset; i < offset + 4; i++) {
    interceptedBits += hmacDigestBinaryArray[i];
  }

  const slicedInterceptedBits = interceptedBits.slice(0, 31);

  const password = parseInt(slicedInterceptedBits, 2) % 10 ** 6;

  console.log(password);

  return password;
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
        const currentPassword = generatePassword(
          user2FaData.twofaSecret,
          user2FaData.twofaUnixT0,
          currentTimeInUnix,
        );

        if (currentPassword === request.body.passwordInput) {
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

        const previousPassword = generatePassword(
          user2FaData.twofaSecret,
          user2FaData.twofaUnixT0,
          currentTimeInUnix - 30,
        );

        if (previousPassword === request.body.passwordInput) {
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

        const nextPassword = generatePassword(
          user2FaData.twofaSecret,
          user2FaData.twofaUnixT0,
          currentTimeInUnix + 30,
        );

        if (nextPassword === request.body.passwordInput) {
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
    }

    response.status(401).json({
      errors: [
        {
          message: 'Unauthorized',
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
