import { serialize } from 'cookie';

export function createSerializedRegisterTokenCookie(
  token: string,
  type: string,
  options?: {
    expired: boolean;
  },
) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (options?.expired) {
    const cookieType = type === 'access' ? 'aT' : 'rT';

    return serialize(cookieType, token, {
      expires: new Date(Date.now() - 1000),

      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
    });
  }

  if (type === 'access') {
    const maxAge = 30;

    return serialize('aT', token, {
      maxAge: maxAge,

      expires: new Date(Date.now() + maxAge * 1000),

      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
    });
  }

  if (type === 'refresh') {
    const maxAge = 60 * 60 * 24 * 30 * 2;

    return serialize('rT', token, {
      maxAge: maxAge,

      expires: new Date(Date.now() + maxAge * 1000),

      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
    });
  }
}
