import { GetServerSidePropsContext } from 'next';
import { generateCsrfToken } from '../../util/auth';

export default function Register(props) {
  const test = async () => {
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'abc',
        password: 'abc',
        csrfToken: props.csrfToken.token,
        csrfSaltId: props.csrfToken.id,
      }),
    });
  };

  return <button onClick={() => test()}>test</button>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = await generateCsrfToken();

  return {
    props: {
      csrfToken: token,
    },
  };
}
