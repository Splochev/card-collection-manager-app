import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const InputContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  marginLeft: 0,
  width: '100%',
}));

const StartAdornmentWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(OutlinedInput)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
  },
}));

interface InputAdornmentsProps {
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  type?: string;
  responsive?: boolean;
  id?: string;
}

export default function CoreInput({
  label,
  value,
  onChange,
  startIcon,
  endIcon,
  type = 'text',
  responsive = false,
  id,
}: InputAdornmentsProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <FormControl
      sx={{
        m: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        height: 40,
        position: 'relative',
        maxWidth: responsive
          ? {
              xs: 200,
              sm: 250,
              md: 400,
              lg: 500,
              xl: 600,
            }
          : '100%',
        '@media (max-width:700px)': {
          maxWidth: responsive ? 175 : '100%',
        },
        '@media (max-width:675px)': {
          maxWidth: responsive ? 150 : '100%',
        },
        '@media (max-width:650px)': {
          maxWidth: responsive ? 125 : '100%',
        },
      }}
      variant="outlined"
    >
      <InputLabel
        htmlFor={label}
        sx={
          isFocused || value
            ? null
            : {
                position: 'absolute',
                left: (theme) =>
                  `calc(1em + ${theme.spacing(startIcon ? 4 : 0)})`,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'inherit',

                width: `calc(100% - ${
                  endIcon && startIcon ? 5 : endIcon || startIcon ? 4 : 0
                }em)`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }
        }
      >
        {label}
      </InputLabel>
      <InputContainer>
        <StartAdornmentWrapper>{startIcon}</StartAdornmentWrapper>
        <StyledInputBase
          sx={{
            '& .MuiInputBase-input': {
              paddingLeft: (theme) =>
                `calc(1em + ${theme.spacing(startIcon ? 4 : 0)})`,
            },
          }}
          id={id || label}
          label={label}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          endAdornment={
            !endIcon ? null : (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            )
          }
        />
      </InputContainer>
    </FormControl>
  );
}
