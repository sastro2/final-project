import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  KeyboardEvent,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { generateCsrfToken } from '../../util/auth';
import { LoginResponseBody } from '../api/auth/login';

type LoginProps = {
  csrfToken: { id: number; token: string };
};

let twoFaUserID: number;
let twoFaUsername: string;
let twoFaPassword: string;

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

  const first2FaInputRef = useRef<HTMLInputElement | null>(null);
  const second2FaInputRef = useRef<HTMLInputElement | null>(null);
  const third2FaInputRef = useRef<HTMLInputElement | null>(null);
  const fourth2FaInputRef = useRef<HTMLInputElement | null>(null);
  const fifth2FaInputRef = useRef<HTMLInputElement | null>(null);
  const sixth2FaInputRef = useRef<HTMLInputElement | null>(null);

  console.log(twoFaWindowActive);

  const change2FaNumbers = (
    event: KeyboardEvent<HTMLInputElement>,
    stateFunction: Dispatch<SetStateAction<number | undefined>>,
    ref: MutableRefObject<HTMLInputElement | null>,
  ) => {
    if (
      (event.key === '1' ||
        event.key === '2' ||
        event.key === '3' ||
        event.key === '4' ||
        event.key === '5' ||
        event.key === '6' ||
        event.key === '7' ||
        event.key === '8' ||
        event.key === '9' ||
        event.key === '0' ||
        event.key === 'Backspace') &&
      ref.current
    ) {
      if (event.key === 'Backspace') {
        stateFunction(undefined);
        ref.current.value = '';

        return;
      }

      stateFunction(parseInt(event.key));
      ref.current.value = '';

      return;
    }
  };

  const removeNonNumericValues = (
    event: ChangeEvent<HTMLInputElement>,
    ref: MutableRefObject<HTMLInputElement | null>,
  ) => {
    if (ref.current) {
      if (isNaN(parseInt(event.currentTarget.value))) {
        ref.current.value = '';
        return;
      }
      if (!isNaN(parseInt(event.currentTarget.value))) {
        const slicedInput = event.currentTarget.value.slice(0, 1);

        ref.current.value = slicedInput;
        return;
      }
    }
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
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
        twoFaUserID = loginResponseBody.twoFaData.userId;
        twoFaPassword = loginResponseBody.twoFaData.password;
        twoFaUsername = loginResponseBody.twoFaData.username;
      }
    }
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
        'http://localhost:3000/api/auth/generateTOTP',
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

      const twoFaResponseBody =
        (await twoFaResponse.json()) as TotpResponseBody;

      if ('passwordMatches' in twoFaResponseBody) {
        if (twoFaResponseBody.passwordMatches) {
          console.log('worked');
        }
        if (!twoFaResponseBody.passwordMatches) {
          console.log('worked2');
        }
      }
    }
  };

  return (
    <>
      <form onSubmit={(event) => login(event)}>
        <input onChange={(event) => setUsername(event.currentTarget.value)} />
        <input onChange={(event) => setPassword(event.currentTarget.value)} />
        <button>submit</button>
      </form>
      {twoFaWindowActive ? (
        <form onSubmit={(event) => authenticate(event)}>
          <input
            ref={first2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setFirst2FaNumber, first2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, first2FaInputRef)
            }
            required
          />
          <input
            ref={second2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setSecond2FaNumber, second2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, second2FaInputRef)
            }
            required
          />
          <input
            ref={third2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setThird2FaNumber, third2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, third2FaInputRef)
            }
            required
          />
          <input
            ref={fourth2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setFourth2FaNumber, fourth2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, fourth2FaInputRef)
            }
            required
          />
          <input
            ref={fifth2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setFifth2FaNumber, fifth2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, fifth2FaInputRef)
            }
            required
          />
          <input
            ref={sixth2FaInputRef}
            onKeyDown={(event) =>
              change2FaNumbers(event, setSixth2FaNumber, sixth2FaInputRef)
            }
            onChange={(event) =>
              removeNonNumericValues(event, sixth2FaInputRef)
            }
            required
          />
          <button>submit</button>
        </form>
      ) : null}
    </>
  );
}

export async function getServerSideProps() {
  const token = await generateCsrfToken();

  return {
    props: {
      csrfToken: token,
    },
  };
}
