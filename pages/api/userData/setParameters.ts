import { NextApiRequest, NextApiResponse } from 'next';
import { setSearchParamsForUserById } from '../../../util/database';

type SetParamsRequestBody = {
  userId: number;
  params: string;
  toRent: boolean;
};

type SetParamsNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: SetParamsRequestBody;
};

export default async function setParametersHandler(
  request: SetParamsNextApiRequest,
  response: NextApiResponse,
) {
  console.log('hi');

  if (request.method === 'POST') {
    await setSearchParamsForUserById(
      request.body.userId,
      request.body.params,
      request.body.toRent,
    );

    response.status(200).send('Ok');
    return;
  }

  response.status(403).send('Use method Post');
  return;
}
