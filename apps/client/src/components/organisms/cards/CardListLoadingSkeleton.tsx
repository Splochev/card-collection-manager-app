import { Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { h6TypographyProps } from '../../../constants';

const STYLES = {
  gridWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxWidth: '35rem',
    minWidth: '21rem',
    flex: { xs: '1 1 100%', md: '0 0 35rem' },
    width: { xs: '100%', md: '35rem' },
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    overflowY: 'auto',
    paddingRight: 2,
  },
  skeleton: {
    maxWidth: '35rem',
    height: 175,
    width: '100%',
    maxHeight: 175,
  },
};

const CardListLoadingSkeleton = () => {
  return (
    <Grid sx={STYLES.gridWrapper}>
      <Typography {...h6TypographyProps}>Other Cards from set</Typography>
      <Grid sx={STYLES.grid}>
        {Array.from({ length: 4 }).map((_, index) => {
          return (
            <Skeleton
              key={`card-list-loading-skeleton-${index}`}
              variant="rounded"
              sx={STYLES.skeleton}
            />
          );
        })}
      </Grid>
    </Grid>
  );
};

export default CardListLoadingSkeleton;
