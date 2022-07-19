import { Checkbox, Fade } from '@material-ui/core';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Grid, Typography } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Dispatch, SetStateAction, useState } from 'react';
import { UserProfileProps } from '../../../pages/users/profile/[userId]';
import {
  handle2FaUnixT0,
  toggle2FaSetting,
} from '../../../util/methods/pages/users/profile/userProfileFunctions';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
};

const handleContinueClicked = async (
  scannedCodeChecked: boolean,
  setTwoFaSwitchChecked: Dispatch<SetStateAction<boolean>>,
  props: UserProfileProps,
  twoFaTurnedOn: boolean,
  setTwoFaTurnedOn: Dispatch<SetStateAction<boolean>>,
) => {
  if (scannedCodeChecked) {
    await toggle2FaSetting(props, twoFaTurnedOn);
    setTwoFaTurnedOn(true);
    setTwoFaSwitchChecked(true);
  }
};

type ProfileToggle2FaModalProps = {
  twoFaTurnedOn: boolean;
  setTwoFaTurnedOn: Dispatch<SetStateAction<boolean>>;
  qrCodeValue: string;
  setTwoFaSwitchChecked: Dispatch<SetStateAction<boolean>>;
  setTwoFaModalActive: Dispatch<SetStateAction<boolean>>;
  props: UserProfileProps;
  unixTime: number | undefined;
  setUnixTime: Dispatch<SetStateAction<number | undefined>>;
};

export default function ProfileToggle2FaModal(
  props: ProfileToggle2FaModalProps,
) {
  const [open, setOpen] = useState(true);
  const [scannedCodeChecked, setScannedCodeChecked] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    props.setTwoFaModalActive(false);
  };

  return (
    <div>
      <Modal
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
            {!props.twoFaTurnedOn ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h4" marginBottom="25px">
                  To turn on 2FA
                </Typography>
                <Typography variant="subtitle1">
                  1. Download the sastro-auth app
                </Typography>
                <Typography variant="subtitle1">
                  2. Open the app and click on "SCAN QRCODE"
                </Typography>
                <Typography variant="subtitle1">
                  3. Scan the following QR Code
                </Typography>
                <Button
                  onClick={async () => [
                    await handle2FaUnixT0(
                      props.props,
                      props.unixTime,
                      props.setUnixTime,
                    ),
                    setShowQrCode(!showQrCode),
                  ]}
                >
                  {!showQrCode ? (
                    <Typography
                      variant="subtitle2"
                      display="flex"
                      alignItems="center"
                      marginTop="8px"
                    >
                      <KeyboardArrowDownIcon />
                      Show QR Code
                    </Typography>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      display="flex"
                      alignItems="center"
                      marginTop="8px"
                      marginBottom="2px"
                    >
                      <KeyboardArrowUpIcon />
                      Hide QR Code
                    </Typography>
                  )}
                </Button>
                {showQrCode ? (
                  <QRCodeSVG size={256} value={props.qrCodeValue} />
                ) : null}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '25px',
                  }}
                >
                  <Typography variant="subtitle2">
                    I have scanned the QR Code
                  </Typography>
                  <Checkbox
                    color="primary"
                    onChange={() => setScannedCodeChecked(!scannedCodeChecked)}
                  />
                  <Button
                    variant="contained"
                    onClick={async () => [
                      await handleContinueClicked(
                        scannedCodeChecked,
                        props.setTwoFaSwitchChecked,
                        props.props,
                        props.twoFaTurnedOn,
                        props.setTwoFaTurnedOn,
                      ),
                      handleClose(),
                    ]}
                  >
                    CONTINUE
                  </Button>
                </div>
              </div>
            ) : (
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Do you really want to turn off 2FA?
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent="center"
                  marginTop="20px"
                >
                  <Button
                    onClick={async () => [
                      await toggle2FaSetting(props.props, true),
                      props.setTwoFaSwitchChecked(false),
                      props.setTwoFaTurnedOn(false),
                      handleClose(),
                    ]}
                  >
                    YES
                  </Button>
                  <Button onClick={() => handleClose()}>NO</Button>
                </Grid>
              </Grid>
            )}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
