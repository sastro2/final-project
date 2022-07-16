import { Switch } from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Typography } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Cookies from 'cookies';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { SyntheticEvent, useState } from 'react';
import Header from '../../../Components/Layout/Header';
import ProfileToggle2FaModal from '../../../Components/users/profile/ProfileToggle2FaModal';
import { generateCsrfToken } from '../../../util/auth';
import {
  getSettingsForUserById,
  getUserIdByAccessToken,
  getUserIdByRefreshToken,
  getUserWith2FaSecretById,
} from '../../../util/database';
import {
  handle2FaUnixT0,
  toggle2FaSetting,
} from '../../../util/methods/pages/users/profile/userProfileFunctions';
import { RefreshAccessResponseBody } from '../../api/auth/refreshAccess';

export type UserProfileProps = {
  access: boolean;
  settings?: Settings;
  user?: User;
  reusedRefreshToken?: boolean;
};

export default function UserDetail(props: UserProfileProps) {
  const [showQrCode, setShowQrCode] = useState(false);
  const [unixTime, setUnixTime] = useState(props.user?.twofaUnixT0);
  const [twoFaTurnedOn, setTwoFaTurnedOn] = useState<boolean>(
    props.settings ? props.settings.has2Fa : false,
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [twoFaSwitchChecked, setTwoFaSwitchChecked] = useState<boolean>(
    props.settings ? props.settings.has2Fa : false,
  );
  const [twoFaModalActive, setTwoFaModalActive] = useState<boolean>(false);

  const router = useRouter();

  if (router.query.activeTab) {
    setActiveTab(parseInt(router.query.activeTab as string));
  }

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (props.reusedRefreshToken) {
    return <h1>Token reuse detected please relog</h1>;
  }

  if (!props.access) {
    return <h1>Please log in or register</h1>;
  }

  if (activeTab === 1) {
    return (
      <>
        {twoFaModalActive && props.user?.twofaSecret && unixTime ? (
          <ProfileToggle2FaModal
            twoFaTurnedOn={twoFaTurnedOn}
            qrCodeValue={`${props.user.twofaSecret},${unixTime}, ${props.user.username}`}
          />
        ) : null}
        <Header loggedIn user={props.user} />
        <div style={{ display: 'flex' }}>
          <Button
            onClick={() => {
              router.back();
            }}
          >
            <KeyboardReturnIcon fontSize="large" />
          </Button>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<AccountCircleIcon />} label="Profile" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </div>
        {props.settings ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1">2FA</Typography>
              <Switch
                color="primary"
                checked={twoFaSwitchChecked}
                onChange={() => setTwoFaModalActive(true)}
              />
            </div>
            {twoFaTurnedOn ? <h3>2FA turned on</h3> : <h3>2FA turned off</h3>}
            <button
              onClick={async () => [
                await toggle2FaSetting(props, twoFaTurnedOn),
                await handle2FaUnixT0(props, showQrCode, unixTime, setUnixTime),
                setTwoFaTurnedOn(!twoFaTurnedOn),
              ]}
            >
              Toggle 2FA
            </button>
          </div>
        ) : null}
        {twoFaTurnedOn ? (
          <button onClick={() => setShowQrCode(!showQrCode)}>
            {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        ) : null}
        {showQrCode && props.user?.twofaSecret && unixTime ? (
          <QRCodeSVG
            size={256}
            value={`${props.user.twofaSecret},${unixTime}, ${props.user.username}`}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Header loggedIn user={props.user} />
      <div style={{ display: 'flex' }}>
        <Button
          onClick={() => {
            router.back();
          }}
        >
          <KeyboardReturnIcon fontSize="large" />
        </Button>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<AccountCircleIcon />} label="Profile" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </div>
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

  let tokenUserId;

  if (refreshToken) {
    tokenUserId = await getUserIdByRefreshToken(refreshToken);
  }

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
      cookies.set(refreshAccessResponseBody.cookies.rT);

      if (!refreshAccessResponseBody.cookies.reusedRefreshToken) {
        cookies.set(refreshAccessResponseBody.cookies.aT);
        const settings = await getSettingsForUserById(userId);
        console.log(refreshAccessResponseBody.cookies.reusedRefreshToken);

        return {
          props: {
            userId: userId,
            access: true,
            settings: settings,
            user: user,
          },
        };
      }

      return {
        props: {
          access: false,
          reusedRefreshToken: true,
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

    const accessUserId = await getUserIdByAccessToken(accessToken);

    if (userId === accessUserId?.userId) {
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

    return {
      props: {
        access: false,
      },
    };
  }
}
