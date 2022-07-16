import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { createSerializedRegisterTokenCookie } from '../../util/cookies';
import { setRefreshTokenToUsed } from '../../util/database';

export default function Logout() {
  return (
    <Head>
      <title>Logout</title>
      <meta name="description" content="Luzon.com" />
    </Head>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const rT = context.req.cookies.rT;
  const aT = context.req.cookies.aT;

  if (rT || aT) {
    await setRefreshTokenToUsed(rT);

    const expiredRt = createSerializedRegisterTokenCookie('', 'refresh', {
      expired: true,
    });
    const expiredAt = createSerializedRegisterTokenCookie('', 'access', {
      expired: true,
    });

    if (expiredAt && expiredRt) {
      context.res.setHeader('Set-Cookie', [expiredAt, expiredRt]);
    } else {
      if (expiredAt) {
        context.res.setHeader('Set-Cookie', expiredAt);
      }

      if (expiredRt) {
        context.res.setHeader('Set-Cookie', expiredRt);
      }
    }
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}
