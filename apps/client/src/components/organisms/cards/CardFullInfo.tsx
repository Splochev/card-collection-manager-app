import { Grid, useMediaQuery } from '@mui/material';
import CardSetInfo from './CardSetInfo';
import CardStats from './CardStats';
import type { ICard } from '../../../interfaces/card.interface';
import CardInfoHeader from './CardInfoHeader';

const STYLES = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    overflowY: 'auto',
    maxWidth: { xs: '100%', md: '35rem' },
    padding: { xs: 0, sm: 2 },
    flex: { xs: '1 1 100%', md: '1 1 35rem' },
    minWidth: { xs: 0, md: 300 },
  },
};

const CardFullInfo = ({ card }: { card: ICard | null }) => {
  const isWiderThan900 = useMediaQuery('(min-width:901px)');

  return (
    <Grid sx={STYLES.grid}>
      {isWiderThan900 && <CardInfoHeader card={card} />}
      <CardSetInfo card={card} />
      <CardStats card={card} />
    </Grid>
  );
};

export default CardFullInfo;
