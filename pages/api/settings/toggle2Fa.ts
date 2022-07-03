import { NextApiRequest, NextApiResponse } from 'next';
import { toggle2FaSettingForUser } from '../../../util/database';

type TwoFaToggleRequestBody = {
  userId: number;
  set2FaTo: boolean;
  unixT0: number | null;
};

type TwoFaNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: TwoFaToggleRequestBody;
};

export default async function handle2FaToggle(
  request: TwoFaNextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
    await toggle2FaSettingForUser(request.body.userId, request.body.set2FaTo);

    response.status(200).send('OK');
    return;
  }

  response.status(403).send('Method not supported try POST');
  return;
}
