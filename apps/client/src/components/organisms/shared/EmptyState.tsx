import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState, type JSX } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CollectionIcon from '../../icons/CollectionIcon';

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

  const iconStyleObj = {
    borderRadius: 2,
    width: 50,
    height: 50,
    padding: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  };

  return (
    <Paper
      component="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevation={isHovered ? 4 : 3}
      onClick={callback}
      sx={{
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
      }}
    >
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '80%',
          gap: 2,
        }}
      >
        <Grid
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <SearchIcon
            sx={{
              ...iconStyleObj,
              background: (theme) => theme.palette.primary.main,
              rotate: '-30deg',
              marginRight: '-8px',
              boxShadow: isHovered
                ? '0px 3px 5px rgba(0, 0, 0, 0.5)'
                : '0px 3px 5px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s',
              transform: isHovered
                ? 'translateX(-15px) translateY(-15px)'
                : 'translateX(0)',
            }}
            color="inherit"
          />
          <AutoAwesomeIcon
            sx={{
              ...iconStyleObj,
              background: (theme) => theme.palette.primary.main,
              marginBottom: 3,
              zIndex: 1,
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.3s',
              transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
            }}
            color="inherit"
          />
          <Grid
            sx={{
              ...iconStyleObj,
              background: (theme) => theme.palette.primary.main,
              rotate: '30deg',
              marginLeft: '-8px',
              boxShadow: isHovered
                ? '0px 3px 5px rgba(0, 0, 0, 0.5)'
                : '0px 3px 5px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.3s',
              transform: isHovered
                ? 'translateX(15px) translateY(-15px)'
                : 'translateX(0)',
            }}
          >
            <CollectionIcon color="inherit" size={50} />
          </Grid>
        </Grid>
        <Typography variant="h5">{title}</Typography>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 0.5,
          }}
        >
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
