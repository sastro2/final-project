import { Button } from '@material-ui/core';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import { FormEvent, useState } from 'react';
import Header from '../../Components/Layout/Header';
import LoginTwoFaPopupModal from '../../Components/users/login/LoginTwoFaPopupModal';
import { generateCsrfToken } from '../../util/auth';
import { getUserIdByRefreshToken } from '../../util/database';
import { LoginResponseBody } from '../api/auth/login';

type LoginProps = {
  csrfToken: { id: number; token: string };
};

let twoFaUserID: number;
let twoFaUsername: string;
let twoFaPassword: string;

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

const theme = createTheme();

export default function Login(props: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaWindowActive, setTwoFaWindowActive] = useState(false);
  const [first2FaNumber, setFirst2FaNumber] = useState<number>();
  const [second2FaNumber, setSecond2FaNumber] = useState<number>();
  const [third2FaNumber, setThird2FaNumber] = useState<number>();
  const [fourth2FaNumber, setFourth2FaNumber] = useState<number>();
  const [fifth2FaNumber, setFifth2FaNumber] = useState<number>();
  const [sixth2FaNumber, setSixth2FaNumber] = useState<number>();

  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  console.log(twoFaWindowActive);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        csrfToken: props.csrfToken.token,
        csrfSaltId: props.csrfToken.id,
      }),
    });

    const loginResponseBody = (await loginResponse.json()) as LoginResponseBody;

    if ('twoFaData' in loginResponseBody) {
      if (loginResponseBody.twoFaData.has2Fa) {
        setTwoFaWindowActive(true);
        setUsername('');
        setPassword('');

        if (usernameInputRef.current && passwordInputRef.current) {
          usernameInputRef.current.value = '';
          passwordInputRef.current.value = '';
        }

        twoFaUserID = loginResponseBody.twoFaData.userId;
        twoFaPassword = loginResponseBody.twoFaData.password;
        twoFaUsername = loginResponseBody.twoFaData.username;

        return;
      }
    }

    if ('errors' in loginResponseBody) {
      return;
    }

    await router.push('/');
  };

  const authenticate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      typeof first2FaNumber === 'number' &&
      typeof second2FaNumber === 'number' &&
      typeof third2FaNumber === 'number' &&
      typeof fourth2FaNumber === 'number' &&
      typeof fifth2FaNumber === 'number' &&
      typeof sixth2FaNumber === 'number'
    ) {
      const passwordInput =
        first2FaNumber * 100000 +
        second2FaNumber * 10000 +
        third2FaNumber * 1000 +
        fourth2FaNumber * 100 +
        fifth2FaNumber * 10 +
        sixth2FaNumber;

      const currentDate = Date.now();

      console.log(
        passwordInput,
        twoFaUserID,
        twoFaUsername,
        twoFaPassword,
        currentDate,
      );

      const twoFaResponse = await fetch(
        'https://home-scout.herokuapp.com/api/auth/generateTOTP',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: twoFaUserID,
            username: twoFaUsername,
            password: twoFaPassword,
            currentDate: currentDate,
            passwordInput: passwordInput,
          }),
        },
      );

      const twoFaResponseBody = (await twoFaResponse.json()) as Omit<
        TotpResponseBody,
        'password'
      > & {
        passwordMatches: boolean;
      };

      if ('passwordMatches' in twoFaResponseBody) {
        if (twoFaResponseBody.passwordMatches) {
          await router.push('/');
        }
        if (!twoFaResponseBody.passwordMatches) {
          console.log('worked2');
        }
      }
    }
  };

  return (
    <>
      <Header loggedIn={false} user={undefined} />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={(event: FormEvent<HTMLFormElement>) =>
                handleLogin(event)
              }
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                inputRef={usernameInputRef}
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                onChange={(event) => setUsername(event.currentTarget.value)}
              />
              <TextField
                margin="normal"
                inputRef={passwordInputRef}
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: '3%', marginBottom: '4%' }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/users/register" variant="body2">
                    "Don't have an account? Sign Up"
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>

      {twoFaWindowActive ? (
        <LoginTwoFaPopupModal
          setFirst2FaNumber={setFirst2FaNumber}
          setSecond2FaNumber={setSecond2FaNumber}
          setThird2FaNumber={setThird2FaNumber}
          setFourth2FaNumber={setFourth2FaNumber}
          setFifth2FaNumber={setFifth2FaNumber}
          setSixth2FaNumber={setSixth2FaNumber}
          setTwoFaWindowActive={setTwoFaWindowActive}
          authenticate={authenticate}
        />
      ) : null}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const rT = context.req.cookies.rT;
  let rtMatches;
  if (rT) {
    rtMatches = await getUserIdByRefreshToken(rT);
  }

  if (rtMatches) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const token = await generateCsrfToken();

  return {
    props: {
      csrfToken: token,
    },
  };
}
