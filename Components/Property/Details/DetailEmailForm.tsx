import { Button, Checkbox } from '@material-ui/core';
import { TextField } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import * as React from 'react';

const style = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
};

const handleEmailAgent = (
  event: React.FormEvent,
  setDetailEmailFormShown: React.Dispatch<React.SetStateAction<boolean>>,
  setShowEmailSuccessSnackbar: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  event.preventDefault();

  setDetailEmailFormShown(false);
  setShowEmailSuccessSnackbar(true);
};

type DetailEmailFormProps = {
  setDetailEmailFormShown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEmailSuccessSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DetailEmailForm(props: DetailEmailFormProps) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={() => [handleClose, props.setDetailEmailFormShown(false)]}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography variant="h4" style={{ marginBottom: '5%' }}>
              Email agent
            </Typography>
            <Typography variant="subtitle2" style={{ marginBottom: '0.5%' }}>
              Required fields are marked with *
            </Typography>
            <Box
              component="form"
              onSubmit={(event: React.FormEvent) =>
                handleEmailAgent(
                  event,
                  props.setDetailEmailFormShown,
                  props.setShowEmailSuccessSnackbar,
                )
              }
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <TextField
                label="Full name"
                style={{ marginBottom: '3%' }}
                required
              />
              <TextField
                label="Email"
                style={{ marginBottom: '3%' }}
                required
              />
              <TextField
                label="Phone number"
                style={{ marginBottom: '3%' }}
                required
              />
              <TextField label="Postcode" style={{ marginBottom: '3%' }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '2.5%',
                }}
              >
                <Typography variant="subtitle1">
                  I am interested in viewing this property
                </Typography>
                <Checkbox color="primary" />
              </div>
              <TextField
                label="Your message"
                multiline
                minRows={5}
                maxRows={10}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: '3%' }}
                fullWidth
              >
                Send enquiry
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
