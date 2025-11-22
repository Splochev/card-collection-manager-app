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
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useMemo, useEffect, memo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../stores/store';
import {
  BACKEND_URL,
  BREAKPOINTS,
  ELEMENT_IDS,
  body1TypographyProps,
  body2TypographyProps,
  h6h6TypographyProps,
} from '../../../constants';
import WishlistManager from './WishlistManager';
import SDK from '../../../sdk/SDK';
import { toast } from 'react-toastify';
import { updateCardWishlist } from '../../../stores/cardSlice';

const STYLES = {
  noCardsText: { textAlign: 'center', padding: 2 },
  iconButton: { marginTop: '-10px', marginRight: '-10px' },
  cardDataBold: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardName: {
    textWrap: 'wrap',
    maxWidth: '12rem',
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paper0: {
    width: '100%',
    padding: 2,
    borderRadius: 3,
    gap: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  box0: { flexShrink: 0 },
  cardImage: {
    width: '6rem',
    height: 'auto',
    borderRadius: 12,
  },
  grid0: {
    width: '100%',
    borderRadius: 3,
    gap: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid1: { width: '100%', height: '100%' },
  grid2: {
    width: '100%',
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
  },
  grid3: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
    gap: 2,
  },
  grid4: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
  },
  grid5: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
  },
  grid6: { width: '100%', height: '100%' },
  grid7: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxWidth: { xs: '100%', md: '35rem' },
    minWidth: { xs: 0, sm: '21rem' },
    paddingBottom: 2,
    flex: { xs: '1 1 100%', md: '0 0 35rem' },
    width: { xs: '100%', md: '35rem' },
  },
  grid8: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    padding: { xs: 0, sm: 2 },
  },
};

const CardListFromSet = () => {
  const cardsList = useSelector((state: RootState) => state.cards.cardsList);
  const selectedCardNumber = useSelector(
    (state: RootState) => state.cards.selectedCardNumber,
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
          (rarity || '').toLowerCase().includes(search),
        ),
    );
  }, [eligibleCards, filterText]);

  return (
    <Grid sx={STYLES.grid7}>
      <Typography {...h6h6TypographyProps}>Other Cards from set</Typography>
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
          ...STYLES.grid8,
          ...(isWideScreen && {
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 220px)',
          }),
        }}
      >
        {displayedCards.length === 0 && filterText.trim() !== '' ? (
          <Typography {...body1TypographyProps} sx={STYLES.noCardsText}>
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
  const sdk = SDK.getInstance(BACKEND_URL);
  const [localCard, setLocalCard] = useState<ICard>(card);
  const [showWishlistInput, setShowWishlistInput] = useState(false);

  useEffect(() => {
    setLocalCard(card);
  }, [card]);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cards/${card.cardNumber}`);
  };

  const onWishlistChange = async (wishlistQuantity?: number) => {
    try {
      await sdk.cardsManager.onWishlistChange(
        localCard.cardNumber,
        wishlistQuantity,
      );

      setLocalCard({
        ...localCard,
        wishlistCount: wishlistQuantity || 0,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: localCard.cardNumber,
          wishlistCount: wishlistQuantity || 0,
        }),
      );

      toast.success(
        wishlistQuantity
          ? `Added to wishlist: ${wishlistQuantity} x ${localCard.name}`
          : `Removed from wishlist: ${localCard.name}`,
      );
    } catch (error) {
      console.error(
        wishlistQuantity
          ? 'Error adding card to wishlist:'
          : 'Error removing card from wishlist:',
        error,
      );
      toast.error(
        wishlistQuantity
          ? 'Failed to add card to wishlist. Please try again.'
          : 'Failed to remove card from wishlist. Please try again.',
      );
    }
  };

  return (
    <Paper elevation={6} sx={STYLES.paper0}>
      <Grid sx={STYLES.grid0}>
        <Box sx={STYLES.box0}>
          <img src={card?.imageUrl} alt={card?.name} style={STYLES.cardImage} />
        </Box>
        <Grid sx={STYLES.grid1}>
          {showWishlistInput ? (
            <WishlistManager
              card={localCard}
              onAddToWishlist={onWishlistChange}
              onRemoveFromWishlist={onWishlistChange}
              variant="full"
              isOpen={showWishlistInput}
              onToggle={() => setShowWishlistInput(!showWishlistInput)}
            />
          ) : (
            <Grid sx={STYLES.grid2}>
              <IconButton
                href={card.marketURL}
                component="a"
                target="_blank"
                sx={STYLES.iconButton}
              >
                <ShoppingCartIcon />
              </IconButton>
              <IconButton
                component="a"
                href={`/cards/${card.cardNumber}`}
                onClick={handleNavigate}
                sx={STYLES.iconButton}
              >
                <LaunchIcon />
              </IconButton>
              <WishlistManager
                card={localCard}
                onAddToWishlist={onWishlistChange}
                onRemoveFromWishlist={onWishlistChange}
                variant="icon-only"
                isOpen={showWishlistInput}
                onToggle={() => setShowWishlistInput(!showWishlistInput)}
              />
            </Grid>
          )}
          <Grid sx={STYLES.grid3}>
            <Typography {...body2TypographyProps}>Name:</Typography>
            <Typography {...body1TypographyProps} sx={STYLES.cardName}>
              {card?.name}
            </Typography>
          </Grid>
          <Grid sx={STYLES.grid5}>
            <Typography {...body2TypographyProps}>Set Code:</Typography>
            <Typography {...body1TypographyProps} sx={STYLES.cardDataBold}>
              {card?.cardNumber}
            </Typography>
          </Grid>
          <Grid sx={STYLES.grid4}>
            <Typography {...body2TypographyProps}>Quantity:</Typography>
            <Typography {...body1TypographyProps} sx={STYLES.cardDataBold}>
              {card?.count}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={STYLES.grid6}>
        <Chips labels={card?.rarities || []} width={'100%'} />
      </Grid>
    </Paper>
  );
});

export default CardListFromSet;
