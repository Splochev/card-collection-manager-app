import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { ICard } from '@card-collection-manager-app/shared';
import {
  body1TypographyProps,
  body2TypographyProps,
  h6TypographyProps,
} from '../../../constants';

const STYLES = {
  paper: {
    padding: 2,
    borderRadius: 3,
    gap: 2,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  gridWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
    gap: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
};

const CardSetInfo = ({ card }: { card: ICard | null }) => (
  <Paper elevation={6} sx={STYLES.paper}>
    <Typography {...h6TypographyProps} marginBottom={2}>
      Set Information
    </Typography>
    <Grid sx={STYLES.gridWrapper}>
      <Typography {...body2TypographyProps}>Set:</Typography>
      <Typography {...body1TypographyProps} sx={STYLES.infoLabel}>
        {card?.cardSetName}
      </Typography>
    </Grid>
    <Grid sx={STYLES.gridWrapper}>
      <Typography {...body2TypographyProps}>Set Code:</Typography>
      <Typography {...body1TypographyProps} sx={STYLES.infoLabel}>
        {card?.cardNumber}
      </Typography>
    </Grid>
  </Paper>
);

export default CardSetInfo;
