import type { ICard } from '../../../interfaces/card.interface';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chips from '../../molecules/Chips';
import Paper from '@mui/material/Paper';
import {
  IconButton,
  useMediaQuery,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useMemo, useEffect, memo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../stores/store';
import { BREAKPOINTS, ELEMENT_IDS } from '../../../constants';
import { handleCardmarketUrl } from '../../../utils';
import WishlistManager from './WishlistManager';
import SDK from '../../../sdk/SDK';
import { toast } from 'react-toastify';
import { updateCardWishlist } from '../../../stores/cardSlice';

const VITE_REACT_LOCAL_BACKEND_URL = import.meta.env
  .VITE_REACT_LOCAL_BACKEND_URL;
if (!VITE_REACT_LOCAL_BACKEND_URL)
  throw new Error('VITE_REACT_LOCAL_BACKEND_URL is not defined');

const CardListFromSet = () => {
  const cardsList = useSelector((state: RootState) => state.cards.cardsList);
  const selectedCardNumber = useSelector(
    (state: RootState) => state.cards.selectedCardNumber
  );

  const isWideScreen = useMediaQuery(BREAKPOINTS.WIDE_SCREEN);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilterText(inputValue);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const excludedCardSet = useMemo(() => {
    const set = new Set<string>();
    if (selectedCardNumber) {
      set.add(selectedCardNumber.toUpperCase());
    }
    return set;
  }, [selectedCardNumber]);

  const eligibleCards = useMemo(() => {
    const seen = new Set<string>();
    return cardsList.filter((card) => {
      if (!card || !card.cardNumber) {
        return false;
      }
      const cardNumber = card.cardNumber.toUpperCase();
      if (excludedCardSet.has(cardNumber) || seen.has(cardNumber)) {
        return false;
      }
      seen.add(cardNumber);
      return true;
    });
  }, [cardsList, excludedCardSet]);

  const displayedCards = useMemo(() => {
    const trimmedSearch = filterText.trim();
    if (!trimmedSearch) {
      return eligibleCards;
    }

    const search = trimmedSearch.toLowerCase();
    return eligibleCards.filter(
      (card) =>
        (card.name?.toLowerCase() || '').includes(search) ||
        (card.cardNumber?.toLowerCase() || '').includes(search) ||
        (card.rarities || []).some((rarity) =>
          (rarity || '').toLowerCase().includes(search)
        )
    );
  }, [eligibleCards, filterText]);

  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: { xs: '100%', md: '35rem' },
        minWidth: { xs: 0, sm: '21rem' },
        paddingBottom: 2,
        flex: { xs: '1 1 100%', md: '0 0 35rem' },
        width: { xs: '100%', md: '35rem' },
      }}
    >
      <Typography variant="h6">Other Cards from set</Typography>
      <TextField
        label="Find cards"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        size="small"
        id={ELEMENT_IDS.CARD_FILTER_INPUT}
        fullWidth
        margin="dense"
      />
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
          padding: { xs: 0, sm: 2 },
          ...(isWideScreen && {
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 220px)',
          }),
        }}
      >
        {displayedCards.length === 0 && filterText.trim() !== '' ? (
          <Typography variant="body1" sx={{ textAlign: 'center', padding: 2 }}>
            No cards found matching your search.
          </Typography>
        ) : (
          displayedCards.map((card) => (
            <CardItem key={`${card.cardNumber}-${card.id}`} card={card} />
          ))
        )}
      </Grid>
    </Grid>
  );
};

const CardItem = memo(({ card }: { card: ICard }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sdk = SDK.getInstance(VITE_REACT_LOCAL_BACKEND_URL);
  const dontAskCardmarket = useSelector(
    (state: RootState) => state.user.dontAskCardmarket
  );
  const [localCard, setLocalCard] = useState<ICard>(card);
  const [showWishlistInput, setShowWishlistInput] = useState(false);
  const [loadingCardmarket, setLoadingCardmarket] = useState(false);

  // Sync localCard when card prop changes (e.g., from Redux updates)
  useEffect(() => {
    setLocalCard(card);
  }, [card]);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cards/${card.cardNumber}`);
  };

  const handleCardmarketClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!card?.cardNumber) return;

    setLoadingCardmarket(true);
    try {
      await handleCardmarketUrl(
        card.cardNumber,
        sdk,
        dispatch,
        dontAskCardmarket
      );
    } finally {
      setLoadingCardmarket(false);
    }
  };

  const handleAddToWishlist = async (wishlistQuantity: number) => {
    try {
      await sdk.cardsManager.addCardToWishlist(
        localCard.cardNumber,
        wishlistQuantity
      );

      setLocalCard({
        ...localCard,
        wishlistCount: wishlistQuantity,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: localCard.cardNumber,
          wishlistCount: wishlistQuantity,
        })
      );

      toast.success(
        `Added to wishlist: ${wishlistQuantity} x ${localCard.name}`
      );
    } catch (error) {
      console.error('Error adding card to wishlist:', error);
      toast.error('Failed to add card to wishlist. Please try again.');
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      await sdk.cardsManager.removeCardFromWishlist(localCard.cardNumber);

      setLocalCard({
        ...localCard,
        wishlistCount: 0,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: localCard.cardNumber,
          wishlistCount: 0,
        })
      );

      toast.success(`Removed from wishlist: ${localCard.name}`);
    } catch (error) {
      console.error('Error removing card from wishlist:', error);
      toast.error('Failed to remove card from wishlist. Please try again.');
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: '100%',
        padding: 2,
        borderRadius: 3,
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Grid
        sx={{
          width: '100%',
          borderRadius: 3,
          gap: 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <img
            src={card?.imageUrl}
            alt={card?.name}
            style={{
              width: '6rem',
              height: 'auto',
              borderRadius: 12,
            }}
          />
        </Box>
        <Grid sx={{ width: '100%', height: '100%' }}>
          {showWishlistInput ? (
            <WishlistManager
              card={localCard}
              onAddToWishlist={handleAddToWishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              variant="full"
              isOpen={showWishlistInput}
              onToggle={() => setShowWishlistInput(!showWishlistInput)}
            />
          ) : (
            <Grid
              sx={{
                width: '100%',
                justifyContent: 'flex-end',
                display: 'flex',
                alignItems: 'baseline',
                gap: 2,
              }}
            >
              <IconButton
                onClick={(e) => handleCardmarketClick(e)}
                disabled={loadingCardmarket}
                sx={{ marginTop: '-10px', marginRight: '-10px' }}
              >
                {loadingCardmarket ? (
                  <CircularProgress size={24} />
                ) : (
                  <ShoppingCartIcon />
                )}
              </IconButton>
              <IconButton
                component="a"
                href={`/cards/${card.cardNumber}`}
                onClick={handleNavigate}
                sx={{ marginTop: '-10px', marginRight: '-10px' }}
              >
                <LaunchIcon />
              </IconButton>
              <WishlistManager
                card={localCard}
                onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                variant="icon-only"
                isOpen={showWishlistInput}
                onToggle={() => setShowWishlistInput(!showWishlistInput)}
              />
            </Grid>
          )}
          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'baseline',
              gap: 2,
            }}
          >
            <Typography variant="body2" component="p">
              Name:
            </Typography>
            <Typography
              variant="body1"
              component="p"
              fontWeight="bold"
              marginBottom={2}
              sx={{ textWrap: 'wrap', maxWidth: '12rem', textAlign: 'right' }}
            >
              {card?.name}
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'baseline',
            }}
          >
            <Typography variant="body2" component="p">
              Set Code:
            </Typography>
            <Typography
              variant="body1"
              component="p"
              fontWeight="bold"
              marginBottom={2}
            >
              {card?.cardNumber}
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'baseline',
            }}
          >
            <Typography variant="body2" component="p">
              Quantity:
            </Typography>
            <Typography
              variant="body1"
              component="p"
              fontWeight="bold"
              marginBottom={2}
            >
              {card?.count}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={{ width: '100%', height: '100%' }}>
        <Chips labels={card?.rarities || []} width={'100%'} />
      </Grid>
    </Paper>
  );
});

export default CardListFromSet;
