import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState, type JSX } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CollectionIcon from '../../icons/CollectionIcon';
import { t } from './../../../constants';

const STYLES = {
  flexContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'space-around',
    height: 'fit-content',
    paddingY: 12,
    borderRadius: 2,
    cursor: 'pointer',
    maxWidth: '800px',
    width: '100%',
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '80%',
    gap: 2,
  },
  iconsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  iconStyleObj: {
    borderRadius: 2,
    width: 50,
    height: 50,
    padding: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    background: (theme: any) => theme.palette.primary.main,
    transition: 'transform 0.3s',
  },
  description: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 0.5,
  },
};

const EmptyState = ({
  title,
  description,
  callback,
  custom,
}: {
  title: string;
  description: string;
  callback: () => void;
  custom?: () => JSX.Element;
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const getStyle = (p: 'left' | 'center' | 'right') => ({
    ...STYLES.iconStyleObj,
    rotate: p === 'center' ? '0deg' : `${p === 'left' ? '-' : '+'}30deg`,
    ...(p !== 'center' ? { [`margin${p}`]: '-8px' } : { marginBottom: 3 }),
    boxShadow:
      p === 'center'
        ? '0px 3px 5px rgba(0, 0, 0, 0.4)'
        : isHovered
          ? '0px 3px 5px rgba(0, 0, 0, 0.5)'
          : '0px 3px 5px rgba(0, 0, 0, 0.2)',
    transform: isHovered
      ? p === 'center'
        ? 'translateY(-8px)'
        : `translateX(${p === 'left' ? '-' : '+'}15px) translateY(-15px)`
      : 'translateX(0)',
    zIndex: p === 'center' ? 1 : 0,
  });

  return (
    <Paper
      component="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevation={isHovered ? 5 : 3}
      onClick={callback}
      sx={STYLES.flexContainer}
    >
      <Grid sx={STYLES.innerContainer}>
        <Grid sx={STYLES.iconsContainer}>
          <SearchIcon sx={getStyle('left')} color="inherit" />
          <AutoAwesomeIcon sx={getStyle('center')} color="inherit" />
          <Grid sx={getStyle('right')}>
            <CollectionIcon color="inherit" size={50} />
          </Grid>
        </Grid>
        <Typography {...t.h5}>{title}</Typography>
        <Typography {...t.p.body2} sx={STYLES.description}>
          {description.split(/\r?\n/).map((line, idx) => (
            <span key={`description-${idx}`}>
              {line}
              <br />
            </span>
          ))}
        </Typography>
        {custom && custom()}
      </Grid>
    </Paper>
  );
};

export default EmptyState;
