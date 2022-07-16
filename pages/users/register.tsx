import { generateCsrfToken } from '../../util/auth';

export default function Register(props: any) {
  const test = async () => {
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testUser',
        password: 'testUser',
        csrfToken: props.csrfToken.token,
        csrfSaltId: props.csrfToken.id,
      }),
    });

    console.log(registerResponse);
  };

  return <button onClick={() => test()}>test</button>;
}

export async function getServerSideProps() {
  const token = await generateCsrfToken();

  return {
    props: {
      csrfToken: token,
    },
  };
}
