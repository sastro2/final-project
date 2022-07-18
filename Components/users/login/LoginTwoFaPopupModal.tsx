import { Typography } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  KeyboardEvent,
  MutableRefObject,
  SetStateAction,
  useRef,
} from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 432,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
};

const twoFaInputStlye = {
  height: '70px',
  width: '39px',
  margin: '3px',
  type: 'text',
  fontSize: '48px',
};

const change2FaNumbers = (
  event: KeyboardEvent<HTMLInputElement>,
  stateFunction: Dispatch<SetStateAction<number | undefined>>,
  ref: MutableRefObject<HTMLInputElement | null>,
  prevRef?: MutableRefObject<HTMLInputElement | null>,
) => {
  if (
    (event.key === '1' ||
      event.key === '2' ||
      event.key === '3' ||
      event.key === '4' ||
      event.key === '5' ||
      event.key === '6' ||
      event.key === '7' ||
      event.key === '8' ||
      event.key === '9' ||
      event.key === '0' ||
      event.key === 'Backspace') &&
    ref.current
  ) {
    if (event.key === 'Backspace') {
      stateFunction(undefined);
      if (prevRef?.current) {
        if (ref.current.value === '') {
          prevRef.current.focus();
          return;
        }
      }
      ref.current.value = '';
      return;
    }

    console.log(stateFunction);

    stateFunction(parseInt(event.key));
    ref.current.value = '';

    return;
  }
};

const removeNonNumericValues = (
  event: ChangeEvent<HTMLInputElement>,
  ref: MutableRefObject<HTMLInputElement | null>,
  nextRef?: MutableRefObject<HTMLInputElement | null>,
) => {
  if (ref.current) {
    if (isNaN(parseInt(event.currentTarget.value))) {
      ref.current.value = '';
      return;
    }
    if (!isNaN(parseInt(event.currentTarget.value))) {
      const slicedInput = event.currentTarget.value.slice(0, 1);

      ref.current.value = slicedInput;
      if (nextRef?.current) {
        nextRef.current.focus();
      }
      return;
    }
  }
};

type LoginTwoFaPopupModalProps = {
  setFirst2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setSecond2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setThird2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setFourth2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setFifth2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setSixth2FaNumber: Dispatch<SetStateAction<number | undefined>>;
  setTwoFaWindowActive: Dispatch<SetStateAction<boolean>>;
  authenticate: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function LoginTwoFaPopupModal(props: LoginTwoFaPopupModalProps) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => {
    props.setTwoFaWindowActive(false);
    setOpen(false);
  };

  const first2FaInputRef = useRef<HTMLInputElement | null>(null);
  const second2FaInputRef = useRef<HTMLInputElement | null>(null);
  const third2FaInputRef = useRef<HTMLInputElement | null>(null);
  const fourth2FaInputRef = useRef<HTMLInputElement | null>(null);
  const fifth2FaInputRef = useRef<HTMLInputElement | null>(null);
  const sixth2FaInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography variant="subtitle2" marginBottom="15px">
              Please check your authenticator app and enter the code
            </Typography>
            <form
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onSubmit={(event) => props.authenticate(event)}
            >
              <input
                style={twoFaInputStlye}
                ref={first2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setFirst2FaNumber,
                    first2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(
                    event,
                    first2FaInputRef,
                    second2FaInputRef,
                  )
                }
                required
              />
              <input
                style={twoFaInputStlye}
                ref={second2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setSecond2FaNumber,
                    second2FaInputRef,
                    first2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(
                    event,
                    second2FaInputRef,
                    third2FaInputRef,
                  )
                }
                required
              />
              <input
                style={twoFaInputStlye}
                ref={third2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setThird2FaNumber,
                    third2FaInputRef,
                    second2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(
                    event,
                    third2FaInputRef,
                    fourth2FaInputRef,
                  )
                }
                required
              />
              <input
                style={twoFaInputStlye}
                ref={fourth2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setFourth2FaNumber,
                    fourth2FaInputRef,
                    third2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(
                    event,
                    fourth2FaInputRef,
                    fifth2FaInputRef,
                  )
                }
                required
              />
              <input
                style={twoFaInputStlye}
                ref={fifth2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setFifth2FaNumber,
                    fifth2FaInputRef,
                    fourth2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(
                    event,
                    fifth2FaInputRef,
                    sixth2FaInputRef,
                  )
                }
                required
              />
              <input
                style={twoFaInputStlye}
                ref={sixth2FaInputRef}
                onKeyDown={(event) =>
                  change2FaNumbers(
                    event,
                    props.setSixth2FaNumber,
                    sixth2FaInputRef,
                    fifth2FaInputRef,
                  )
                }
                onChange={(event) =>
                  removeNonNumericValues(event, sixth2FaInputRef)
                }
                required
              />
              <Button
                type="submit"
                variant="contained"
                style={{ marginLeft: '8px' }}
                sx={{ ml: '5px' }}
              >
                SIGN IN
              </Button>
            </form>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
