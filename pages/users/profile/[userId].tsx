import Cookies from 'cookies';
import { GetServerSidePropsContext } from 'next';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { generateCsrfToken } from '../../../util/auth';
import {
  getSettingsForUserById,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../../../util/database';
import { unixTimeFromNumber } from '../../../util/sharedMethods/convertDateToUnixTime';
import { RefreshAccessResponseBody } from '../../api/auth/refreshAccess';

type UserProfileProps = {
  access: boolean;
  settings?: Settings;
  user?: User;
};

export default function UserDetail(props: UserProfileProps) {
  const [showQrCode, setShowQrCode] = useState(false);
  const [unixTime, setUnixTime] = useState(props.user?.twofaUnixT0);

  if (!props.access) {
    return <h1>Please log in or register</h1>;
  }

  const toggle2FaSetting = async () => {
    if (props.settings && props.user) {
      await fetch('/api/settings/toggle2Fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: props.user.id,
          unixT0: props.user.twofaUnixT0,
          set2FaTo: !props.settings.has2Fa,
        }),
      });
    }
    setShowQrCode(!showQrCode);
  };

  const handle2FaUnixT0 = async () => {
    if (showQrCode) {
      if (!unixTime) {
        const currentTime = unixTimeFromNumber(Date.now());

        setUnixTime(currentTime);
        if (props.user) {
          await fetch('/api/settings/set2FaUnixT0', {
            body: JSON.stringify({
              userId: props.user.id,
              unixTime: currentTime,
            }),
          });
        }
      }
    }
  };

  return (
    <>
      <h1>Profile</h1>
      {props.settings ? (
        <div>
          {props.settings.has2Fa ? (
            <h3>2FA turned on</h3>
          ) : (
            <h3>2FA turned off</h3>
          )}
          <button
            onClick={async () => [
              await toggle2FaSetting(),
              await handle2FaUnixT0(),
            ]}
          >
            Toggle 2FA
          </button>
        </div>
      ) : null}
      {showQrCode && props.user?.twofaSecret ? (
        <QRCodeSVG
          size={256}
          value={`${props.user.twofaSecret},${unixTime}, ${props.user.username}`}
        />
      ) : null}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let userId;
  if (typeof context.query.userId === 'string') {
    userId = parseInt(context.query.userId);
  }
  const accessToken = context.req.cookies.aT;
  const refreshToken = context.req.cookies.rT;

  const tokenUserId = await getUserIdByRefreshToken(refreshToken);

  const cookies = new Cookies(context.req, context.res);

  if (!accessToken && userId) {
    console.log('1');

    if (!refreshToken) {
      console.log('2');

      return {
        props: {
          access: false,
        },
      };
    }

    if (!(userId === tokenUserId?.userId)) {
      console.log('3');

      return {
        props: {
          access: false,
        },
      };
    }
    console.log('4');
    const user = await getUserWith2FaSecretById(userId);
    const csrf = await generateCsrfToken();

    const refreshAccessResponse = await fetch(
      'http://localhost:3000/api/auth/refreshAccess',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
          csrfToken: csrf.token,
          csrfSaltId: csrf.id,
          userId: userId,
        }),
      },
    );

    const refreshAccessResponseBody =
      (await refreshAccessResponse.json()) as RefreshAccessResponseBody;

    if ('cookies' in refreshAccessResponseBody) {
      console.log('5');

      cookies.set(refreshAccessResponseBody.cookies.rT);
      cookies.set(refreshAccessResponseBody.cookies.aT);

      const settings = await getSettingsForUserById(userId);
      console.log('here');

      return {
        props: {
          userId: userId,
          access: true,
          settings: settings,
          user: user,
        },
      };
    }
    console.log('6');

    return {
      props: {
        access: false,
      },
    };
  }

  if (accessToken && userId) {
    console.log('7');

    if (userId === tokenUserId?.userId) {
      const user = await getUserWith2FaSecretById(userId);
      console.log('8');

      const settings = await getSettingsForUserById(userId);

      return {
        props: {
          userId: userId,
          access: true,
          settings: settings,
          user: user,
        },
      };
    }
  }
}
