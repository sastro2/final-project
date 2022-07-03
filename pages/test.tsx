export default function Test() {
  return (
    <>
      <button
        onClick={async () => {
          await fetch('http://localhost:3000/api/auth/generateTOTP');
        }}
      >
        Totp Test
      </button>
      <button
        onClick={async () => {
          const response = await fetch('http://localhost:4000/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              twoFaSecret: 'foniwfown23r209hdfwnefd',
              twoFaUnixT0: 1234,
              currentTimeInUnix: 2345,
              asNumberArray: false,
              applicationPassword: 'KaPdSgVkYp3s6v9y$B&E)H@MbQeThWmZ',
            }),
          });

          const response2 = (await response.json()) as TotpResponseBody;

          if ('errors' in response2) {
            console.log(response2.errors);
          }

          if ('password' in response2) {
            console.log(response2.password);
          }
        }}
      >
        Express Server Test
      </button>
    </>
  );
}
