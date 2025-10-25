import { Grid, Typography, Button, Box, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Chips from '../../molecules/Chips';
import type { ICard } from '../../../interfaces/card.interface';
import { handleCardmarketUrl } from '../../../utils';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../stores/store';
import SDK from '../../../sdk/SDK';
import { BACKEND_URL } from '../../../constants';

const sdk = SDK.getInstance(BACKEND_URL);

const CardInfoHeader = ({ card }: { card: ICard | null }) => {
  const dispatch = useDispatch();
  const dontAskCardmarket = useSelector(
    (state: RootState) => state.user.dontAskCardmarket
  );
  const [loading, setLoading] = useState(false);

  const handleCardmarketClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!card?.cardNumber) return;

    setLoading(true);
    try {
      await handleCardmarketUrl(
        card.cardNumber,
        sdk,
        dispatch,
        dontAskCardmarket
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid width={'100%'}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 1,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="h5"
          sx={{ textWrap: 'wrap', flex: 1, minWidth: '200px' }}
        >
          {card?.name}
        </Typography>
        {card?.cardSetName && card?.name && (
          <Button
            onClick={(e) => handleCardmarketClick(e)}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShoppingCartIcon />
              )
            }
            sx={{
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
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
