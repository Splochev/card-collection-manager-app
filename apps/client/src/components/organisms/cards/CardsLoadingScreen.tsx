import { Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';
import CardListLoadingSkeleton from './CardListLoadingSkeleton';

const STYLES = {
  grid0: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 4,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  grid1: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: { xs: '1 1 100%', md: '0 0 25rem' },
    width: { xs: '100%', md: '25rem' },
    minWidth: { xs: 0, md: '18em' },
    maxWidth: { xs: '21rem', md: '25rem' },
  },
  grid3: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    overflowY: 'auto',
    maxWidth: '35rem',
    flex: { xs: '1 1 100%', md: '1 1 35rem' },
    minWidth: { xs: 0, md: 300 },
  },
  skeleton580: { height: 580, width: '100%' },
  skeleton140: { height: 140, width: '100%' },
  skeleton80: { height: 80, width: '100%' },
  skeleton160: { height: 160, width: '100%' },
  skeleton400: { height: 400, width: '100%' },
};

const skeletonProps = {
  variant: 'rounded' as const,
  animation: 'wave' as const,
};

const CardsLoadingScreen = () => {
  return (
    <Grid sx={STYLES.grid0}>
      <Grid sx={STYLES.grid1}>
        <Skeleton {...skeletonProps} sx={STYLES.skeleton580} />
        <Skeleton {...skeletonProps} sx={STYLES.skeleton140} />
      </Grid>
      <Grid sx={STYLES.grid3}>
        <Skeleton {...skeletonProps} sx={STYLES.skeleton80} />
        <Skeleton {...skeletonProps} sx={STYLES.skeleton160} />
        <Skeleton {...skeletonProps} sx={STYLES.skeleton400} />
      </Grid>
      <CardListLoadingSkeleton />
    </Grid>
  );
};

export default CardsLoadingScreen;
