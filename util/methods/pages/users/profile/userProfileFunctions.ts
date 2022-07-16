import { Dispatch, SetStateAction } from 'react';
import { UserProfileProps } from '../../../../../pages/users/profile/[userId]';
import { unixTimeFromNumber } from '../../utils/convertDateToUnixTime';

export const toggle2FaSetting = async (
  props: UserProfileProps,
  twoFaTurnedOn: boolean,
) => {
  if (props.settings && props.user) {
    await fetch('/api/settings/toggle2Fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: props.user.id,
        unixT0: props.user.twofaUnixT0,
        set2FaTo: !twoFaTurnedOn,
      }),
    });
  }
};

export const handle2FaUnixT0 = async (
  props: UserProfileProps,
  showQrCode: boolean,
  unixTime: number | undefined,
  setUnixTime: Dispatch<SetStateAction<number | undefined>>,
) => {
  if (!unixTime) {
    const currentTime = unixTimeFromNumber(Date.now());

    setUnixTime(currentTime);
    if (props.user) {
      console.log('set2FaUnixt0');

      await fetch('/api/settings/set2FaUnixT0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: props.user.id,
          unixTime: currentTime,
        }),
      });
    }
  }
};
