import { FormEvent, useState } from 'react';
import { generateCsrfToken } from '../../util/auth';

export default function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const test = async (event: FormEvent<HTMLFormElement>) => {
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
  };

  return (
    <form onSubmit={(event) => test(event)}>
      <input onChange={(event) => setUsername(event.currentTarget.value)} />
      <input onChange={(event) => setPassword(event.currentTarget.value)} />
      <button>submit</button>
    </form>
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
