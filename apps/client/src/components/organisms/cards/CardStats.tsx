import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { ICard } from '../../../interfaces/card.interface';
import CardDescription from './CardDescription';

const CardStats = ({ card }: { card: ICard | null }) => {
  const typeline = card?.typeline
    ? card.typeline.replace(/["{}]/g, ' ').replace(',', ' / ')
    : card?.type;
  const isMonster = card?.type?.includes('Monster');
  return (
    <Paper
      elevation={6}
      sx={{
        padding: 2,
        borderRadius: 3,
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <Typography variant="h6" component="p">
        Card stats
      </Typography>
      <Grid container spacing={2} justifyContent={'space-between'}>
        <Typography variant="body2" component="p">
          {typeline}
        </Typography>
        <Grid container spacing={2}>
          <Typography variant="body2" component="p">
            {card?.level ? (
              <span style={{ display: 'flex', gap: 8 }}>
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
          <Typography variant="body2" component="p">
            <span style={{ display: 'flex', gap: 8 }}>
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
