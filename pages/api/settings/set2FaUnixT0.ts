import { NextApiRequest, NextApiResponse } from 'next';
import { set2FaUnixT0ForUser } from '../../../util/database';

type TwoFaUnixT0RequestBody = {
  userId: number;
  unixTime: number;
};

type TwoFaUnixT0NextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: TwoFaUnixT0RequestBody;
};

export default async function handleSet2FaUnixT0(
  request: TwoFaUnixT0NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
    await set2FaUnixT0ForUser(request.body.userId, request.body.unixTime);

    response.status(200).send('OK');
    return;
  }

  response.status(403).send('Method not supported try POST');
  return;
}
