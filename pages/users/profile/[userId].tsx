import { Switch } from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Button,
  Card,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Cookies from 'cookies';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
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
import { RefreshAccessResponseBody } from '../../api/auth/refreshAccess';

export type UserProfileProps = {
  access: boolean;
  settings?: Settings;
  user?: User;
  reusedRefreshToken?: boolean;
};

export default function UserDetail(props: UserProfileProps) {
  const [unixTime, setUnixTime] = useState(props.user?.twofaUnixT0);
  const [twoFaTurnedOn, setTwoFaTurnedOn] = useState<boolean>(
    props.settings ? props.settings.has2Fa : false,
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [twoFaSwitchChecked, setTwoFaSwitchChecked] = useState<boolean>(
    props.settings ? props.settings.has2Fa : false,
  );
  const [twoFaModalActive, setTwoFaModalActive] = useState<boolean>(false);
  const [profileEditWindowActive, setProfileEditWindowActive] =
    useState<boolean>(false);

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
        {twoFaModalActive && props.user?.twofaSecret ? (
          <ProfileToggle2FaModal
            twoFaTurnedOn={twoFaTurnedOn}
            setTwoFaTurnedOn={setTwoFaTurnedOn}
            qrCodeValue={`${props.user.twofaSecret},${unixTime}, ${props.user.username} - Home scout`}
            setTwoFaSwitchChecked={setTwoFaSwitchChecked}
            setTwoFaModalActive={setTwoFaModalActive}
            props={props}
            unixTime={unixTime}
            setUnixTime={setUnixTime}
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
          <div style={{ display: 'flex', alignItems: 'center', margin: '2%' }}>
            <Typography variant="subtitle1">2-Factor-Authentication</Typography>
            <Switch
              color="primary"
              checked={twoFaSwitchChecked}
              onChange={() => setTwoFaModalActive(true)}
            />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <main>
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
      <section>
        <Typography margin="2%" variant="h2">
          {props.user?.username}
        </Typography>
        <Card
          style={{
            margin: '2%',
            maxWidth: '500px',
            padding: '1%',
          }}
        >
          {!profileEditWindowActive ? (
            <Grid container rowSpacing={2}>
              <Grid item xs={12} display="flex" justifyContent="space-between">
                <Typography variant="h5">Personal information</Typography>
                <IconButton onClick={() => setProfileEditWindowActive(true)}>
                  <EditIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Name: {props.user?.firstName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Surname: {props.user?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Email {props.user?.email}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid container rowSpacing={1}>
              <Grid item xs={12} display="flex" justifyContent="space-between">
                <Typography variant="h5">Personal information</Typography>
                <IconButton onClick={() => [setProfileEditWindowActive(false)]}>
                  <SaveIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12} display="flex" alignItems="center">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Typography variant="h6">Name:</Typography>
                  <TextField
                    size="small"
                    style={{ marginLeft: '4%', marginRight: '15%' }}
                    fullWidth
                  />
                </div>
              </Grid>
              <Grid item xs={12} display="flex" alignItems="center">
                <Typography variant="h6">Surname:</Typography>
                <TextField
                  size="small"
                  style={{ marginLeft: '4%', marginRight: '15%' }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} display="flex" alignItems="center">
                <Typography variant="h6">Email:</Typography>
                <TextField
                  size="small"
                  style={{ marginLeft: '4%', marginRight: '15%' }}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </Card>
      </section>
    </main>
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
