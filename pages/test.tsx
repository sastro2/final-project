import PropertyImageCarousel from '../Components/Property/Carousel';

export default function Test() {
  return (
    <>
      <PropertyImageCarousel />
      <button
        onClick={async () => {
          const response = await fetch('http://localhost:4000/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              twoFaSecret: 'üüüüüüüüüüüüüüüüüüüü',
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
      <button
        onClick={async () => {
          await fetch('/api/settings/set2FaUnixT0', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: 6,
              unixTime: 6,
            }),
          });
          await fetch('http://localhost:3000/api/tests');
        }}
      >
        getunixt0
      </button>
    </>
  );
}
