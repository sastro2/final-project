import { Checkbox } from '@material-ui/core';
import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const handleContinueClicked = (scannedCodeChecked: boolean) => {
  if (scannedCodeChecked) {
  }
};

type ProfileToggle2FaModalProps = {
  twoFaTurnedOn: boolean;
  qrCodeValue: string;
};

export default function ProfileToggle2FaModal(
  props: ProfileToggle2FaModalProps,
) {
  const [open, setOpen] = useState(true);
  const [scannedCodeChecked, setScannedCodeChecked] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {props.twoFaTurnedOn ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4">To turn on 2FA</Typography>
              <Typography variant="subtitle1">
                1. Download the sastro-auth app
              </Typography>
              <Typography variant="subtitle1">
                2. Open the app and click on "SCAN QRCODE"
              </Typography>
              <Typography variant="subtitle1">
                3. Scan the following QR Code
              </Typography>
              <QRCodeSVG size={256} value={props.qrCodeValue} />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2">
                  I have scanned the QR Code
                </Typography>
                <Checkbox
                  color="primary"
                  onChange={() => setScannedCodeChecked(!scannedCodeChecked)}
                />
                <Button
                  variant="contained"
                  onClick={() => handleContinueClicked(scannedCodeChecked)}
                >
                  CONTINUE
                </Button>
              </div>
            </div>
          ) : null}
        </Box>
      </Modal>
    </div>
  );
}
