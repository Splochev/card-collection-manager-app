import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { ICard } from '@card-collection-manager-app/shared';
import CardDescription from './CardDescription';
import { t } from '../../../constants';

const STYLES = {
  paper: {
    padding: 2,
    borderRadius: 3,
    gap: 2,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  span: { display: 'flex', gap: 8 },
};

const CardStats = ({ card }: { card: ICard | null }) => {
  const typeline =
    card?.typeline && typeof card?.typeline === 'string'
      ? card.typeline.replace(/["{}]/g, ' ').replace(',', ' / ')
      : card?.typeline && Array.isArray(card?.typeline)
        ? card?.typeline.join('').replace(/["{}]/g, ' ').replace(',', ' / ')
        : card?.type;
  const isMonster = card?.type?.includes('Monster');
  return (
    <Paper elevation={6} sx={STYLES.paper}>
      <Typography {...t.p.h6}>Card stats</Typography>
      <Grid container spacing={2} justifyContent={'space-between'}>
        <Typography {...t.p.body2}>{typeline}</Typography>
        <Grid container spacing={2}>
          <Typography {...t.p.body2}>
            {card?.level ? (
              <span style={STYLES.span}>
                <span>Level: {card.level}</span>
                <span>Attribute: {card.attribute}</span>
              </span>
            ) : (
              card?.race
            )}
          </Typography>
        </Grid>
      </Grid>
      <CardDescription desc={card?.desc || ''} />
      {isMonster && (
        <Grid container spacing={2} justifyContent={'end'}>
          <Typography {...t.p.body2}>
            <span style={STYLES.span}>
              <span>ATK/ {card?.atk}</span>
              <span>DEF/ {card?.def}</span>
            </span>
          </Typography>
        </Grid>
      )}
    </Paper>
  );
};

export default CardStats;
