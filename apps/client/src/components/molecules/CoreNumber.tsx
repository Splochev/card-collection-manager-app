import CoreInput from './CoreInput';
import { useRef, useEffect, useState } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { Grid, IconButton, Button, Typography, Paper } from '@mui/material';

const STYLES = {
  buttonStyle: {
    minWidth: 0,
    padding: 0,
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: 2.5,
  },
  paperWrapper: { padding: 2, borderRadius: 3 },
  gridWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  grid: { display: 'flex', alignItems: 'center', gap: '1px' },
  iconPaperWrapper: { padding: 0.9, borderRadius: 2.5 },
  cta: { marginTop: 2, width: '100%' },
  inputWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: { padding: { xs: 0.6, sm: 1 } },
  controlIcon: { fontSize: { xs: '1.15rem', sm: '1.25rem' } },
  label: {
    fontSize: { xs: '0.8rem', sm: '1rem' },
    minWidth: 0,
    flexShrink: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: '0 1 auto',
  },
  controlsGrid: { display: 'flex', gap: 0.5, marginLeft: 0.6 },
};

interface CoreNumberProps {
  min: number;
  max: number;
  value: number | '';
  label: string;
  btnLabel?: string;
  setValue: (value: number | '') => void;
  onSubmit: () => void;
  variant?: 'default' | 'withControls' | 'externalWithControls';
  onCancel?: () => void;
  isLoading?: boolean;
  inputWidth?: number;
}

const CoreNumber = ({
  min,
  max,
  value,
  label,
  btnLabel,
  setValue,
  onSubmit,
  variant = 'default',
  onCancel,
  isLoading = false,
  inputWidth = 80,
}: CoreNumberProps) => {
  const [quantity, setQuantity] = useState<number | ''>(value);
  const [lastValid, setLastValid] = useState<number | ''>(value);
  const holdInterval = useRef<number | null>(null);
  const holdAction = useRef<(() => void) | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const inputRefContainer = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') {
      setQuantity('');
      return;
    }

    const newValue = Number(input);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setQuantity(newValue);
      setLastValid(newValue);
    } else {
      setQuantity(lastValid);
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      if (prev !== '' && prev > min) {
        const newValue = prev - 1;
        setLastValid(newValue);
        return newValue;
      }
      return prev;
    });
  };

  const handleIncrement = () => {
    setQuantity((prev) => {
      if (prev !== '' && prev < max) {
        const newValue = prev + 1;
        setLastValid(newValue);
        return newValue;
      }
      return prev;
    });
  };

  const startHold = (action: () => void) => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
    }

    holdAction.current = action;

    action();

    let speed = 120;
    let elapsed = 0;

    holdInterval.current = window.setInterval(() => {
      elapsed += speed;

      if (holdAction.current) holdAction.current();

      if (elapsed >= 1500 && speed === 120) {
        speed = 40;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearInterval(holdInterval.current!);
        holdInterval.current = window.setInterval(() => {
          if (holdAction.current) holdAction.current();
        }, speed);
      }
    }, speed);
  };

  const stopHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
      holdAction.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdInterval.current) {
        clearInterval(holdInterval.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setQuantity(value);
    setLastValid(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setValue(quantity);
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [quantity, setValue]);

  function onClickPaperFocusInput() {
    const input = inputRefContainer.current?.getElementsByTagName('input')[0];
    input?.focus();
  }

  const buttonProps = (position: 'l' | 'r') => ({
    disabled: quantity === '' || quantity <= min,
    sx: STYLES.buttonStyle,
    onMouseDown: () =>
      startHold(position === 'l' ? handleDecrement : handleIncrement),
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
    },
    onMouseUp: stopHold,
    onMouseLeave: stopHold,
    onTouchStart: () =>
      startHold(position === 'l' ? handleDecrement : handleIncrement),
    onTouchEnd: stopHold,
  });

  const iconButtonProps = (isCheck: boolean) => ({
    size: 'small' as const,
    onClick: isCheck ? onSubmit : onCancel,
    disabled: isLoading,
    sx: STYLES.controlButton,
  });

  const CoreNumberContent = () => {
    return (
      <Grid sx={STYLES.gridWrapper}>
        <Typography variant="body1" component="h3" sx={STYLES.label}>
          {label}
        </Typography>
        <Grid sx={STYLES.grid}>
          <Button {...buttonProps('l')}>
            <Paper elevation={10} sx={STYLES.iconPaperWrapper}>
              <RemoveIcon />
            </Paper>
          </Button>
          <Grid
            sx={{ ...STYLES.inputWrapper, width: `${inputWidth}px` }}
            ref={inputRefContainer}
          >
            <CoreInput
              id="core-number-input"
              type="number"
              value={quantity}
              onChange={handleInputChange}
              responsive
            />
          </Grid>
          <Button {...buttonProps('r')}>
            <Paper elevation={10} sx={STYLES.iconPaperWrapper}>
              <AddIcon />
            </Paper>
          </Button>
          {(variant === 'withControls' ||
            variant === 'externalWithControls') && (
            <Grid sx={STYLES.controlsGrid}>
              <IconButton {...iconButtonProps(true)}>
                <CheckIcon sx={STYLES.controlIcon} color="success" />
              </IconButton>
              <IconButton {...iconButtonProps(false)}>
                <ClearIcon sx={STYLES.controlIcon} color="error" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  };

  if (variant === 'externalWithControls') {
    return <CoreNumberContent />;
  }

  return (
    <Paper
      elevation={6}
      sx={STYLES.paperWrapper}
      onClick={onClickPaperFocusInput}
    >
      <CoreNumberContent />
      {variant === 'default' && (
        <Button variant="contained" sx={STYLES.cta} onClick={onSubmit}>
          {btnLabel}
        </Button>
      )}
    </Paper>
  );
};

export default CoreNumber;
