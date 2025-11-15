import { Grid, Typography, Button, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Chips from '../../molecules/Chips';
import type { ICard } from '../../../interfaces/card.interface';

const STYLES = {
  grid: { width: '100%' },
  box: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
    gap: 2,
    flexWrap: 'wrap',
  },
  Typography: { textWrap: 'wrap', flex: 1, minWidth: '200px' },
  button: {
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};

const CardInfoHeader = ({ card }: { card: ICard | null }) => {
  return (
    <Grid sx={STYLES.grid}>
      <Box sx={STYLES.box}>
        <Typography variant="h5" sx={STYLES.Typography}>
          {card?.name}
        </Typography>
        <Typography variant="h5" sx={STYLES.Typography}>
          {card?.name}
        </Typography>
        {card?.cardSetName && card?.name && (
          <Button
            variant="contained"
            color="primary"
            href={card.marketURL}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<ShoppingCartIcon />}
            sx={STYLES.button}
          >
            View on Cardmarket
          </Button>
        )}
      </Box>
      <Chips labels={card?.rarities || []} />
    </Grid>
  );
};

export default CardInfoHeader;
