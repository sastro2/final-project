import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import { updateUserInformationById } from '../../../util/database';

type SetPersonalDataRequestBody = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  csrfToken: string;
  csrfSaltId: number;
};

type SetPersonalDataNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: SetPersonalDataRequestBody;
};

export default async function setPersonalData(
  request: SetPersonalDataNextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.email !== 'string' ||
      typeof request.body.firstName !== 'string' ||
      typeof request.body.lastName !== 'string'
    ) {
      response.status(400).send('Only strings as input allowed');
      return;
    }
    console.log('2');

    const csrfTokenMatches = await verifyCsrfToken(
      request.body.csrfToken,
      request.body.csrfSaltId,
    );

    if (!csrfTokenMatches) {
      response.status(403).json({
        errors: [
          {
            message: 'Invalid CSRF token',
          },
        ],
      });
      return;
    }
    console.log('3');

    await updateUserInformationById(
      request.body.userId,
      request.body.firstName,
      request.body.lastName,
      request.body.email,
    );

    response.status(200).send('Updated successfully');
    return;
  }

  response.status(403).send('Use method Post');
  return;
}
