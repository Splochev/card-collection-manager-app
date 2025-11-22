import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../stores/store';
import { closeConfirm } from '../../../stores/confirmSlice';
import {
  resolveConfirm,
  getCustom,
  clearCustom,
} from '../../../services/confirmService';
import type { ConfirmVariant } from '../../../stores/confirmSlice';
import Box from '@mui/material/Box';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  body1TypographyProps,
  h6h6TypographyProps,
} from './../../../constants';

const STYLES = {
  icon: {
    marginRight: 1,
  },
  titleBox: { display: 'flex', alignItems: 'center' },
};

const iconFor = (variant: ConfirmVariant) => {
  switch (variant) {
    case 'success':
      return <CheckCircleOutlineIcon color="success" sx={STYLES.icon} />;
    case 'error':
      return <ErrorOutlineIcon color="error" sx={STYLES.icon} />;
    case 'info':
      return <InfoOutlinedIcon color="info" sx={STYLES.icon} />;
    default:
      return <WarningAmberIcon color="warning" sx={STYLES.icon} />;
  }
};

const ConfirmDialog: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.confirm);

  const handleClose = (accepted = false) => {
    const id = state.id;
    dispatch(closeConfirm());
    resolveConfirm(id, accepted);
    clearCustom(id);
  };

  if (!state) return null;

  const buttonColor =
    state.variant === 'error'
      ? 'error'
      : state.variant === 'success'
        ? 'success'
        : 'primary';

  return (
    <Dialog
      open={state.open}
      onClose={() => (state.dismissible ? handleClose() : undefined)}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={STYLES.titleBox}>
          {iconFor(state.variant)}
          <Typography {...h6h6TypographyProps}>{state.title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {getCustom(state.customKey) ? (
          <>{getCustom(state.customKey)}</>
        ) : (
          <Typography {...body1TypographyProps}>{state.message}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {state.cancelText && (
          <Button onClick={() => handleClose(false)} color="inherit">
            {state.cancelText}
          </Button>
        )}
        {state.confirmTextIsHref && state.confirmHref ? (
          <Button
            href={state.confirmHref}
            color={buttonColor}
            onClick={() => handleClose(true)}
            variant="contained"
            component="a"
            target="_blank"
            rel="noopener noreferrer"
          >
            {state.confirmText}
          </Button>
        ) : (
          <Button
            color={buttonColor}
            onClick={() => handleClose(true)}
            variant="contained"
          >
            {state.confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
