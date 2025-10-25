import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { ICard } from '../../../interfaces/card.interface';

const CardSetInfo = ({ card }: { card: ICard | null }) => (
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
    <Typography variant="h6" component="p" marginBottom={2}>
      Set Information
    </Typography>
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" component="p">
        Set:
      </Typography>
      <Typography variant="body1" component="p" fontWeight="bold">
        {card?.cardSetName}
      </Typography>
    </Grid>
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" component="p">
        Set Code:
      </Typography>
      <Typography variant="body1" component="p" fontWeight="bold">
        {card?.cardNumber}
      </Typography>
    </Grid>
  </Paper>
);

export default CardSetInfo;
