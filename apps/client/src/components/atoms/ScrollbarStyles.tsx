import * as React from 'react';
import { GlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ScrollbarStyles(): React.JSX.Element {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const track = isLight
    ? theme.palette.background.default
    : theme.palette.background.paper;

  const primaryMain = theme.palette.primary?.main ?? '#c59d39';
  const primaryLight = theme.palette.primary?.light ?? '#f4d76e';

  const thumb = isLight ? primaryMain : theme.palette.grey?.[700] ?? '#4b5563';

  const thumbHover = isLight
    ? primaryLight
    : theme.palette.grey?.[600] ?? '#6b7280';

  return (
    <GlobalStyles
      styles={{
        '*::-webkit-scrollbar': {
          width: 12,
          height: 12,
        },
        '*::-webkit-scrollbar-track': {
          background: track,
          borderRadius: 999,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: thumb,
          borderRadius: 999,
          border: `3px solid ${track}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: thumbHover,
        },

        html: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${thumb} ${track}`,
        },
      }}
    />
  );
}
