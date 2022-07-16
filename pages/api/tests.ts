import { get2faDataByUserId } from '../../util/database';

export default async function Test(response: any) {
  console.log('hi');

  const test = await get2faDataByUserId(6);
  console.log(test?.twofaSecret, test?.twofaUnixT0);

  response.send('123');
  return;
}
