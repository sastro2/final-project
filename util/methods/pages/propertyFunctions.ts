import { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';

export const handleSearchInputChange = (
  e: ChangeEvent<HTMLInputElement>,
  func: Dispatch<SetStateAction<string>>,
) => {
  func(e.target.value);
};

export const handleSettingsStateChange = (
  ref: RefObject<any>,
  state: Dispatch<SetStateAction<any>>,
) => {
  console.log(ref.current.value);

  state(ref.current.value);
};
