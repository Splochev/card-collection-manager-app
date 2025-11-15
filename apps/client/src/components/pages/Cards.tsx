import CardImageAndQuantity from '../organisms/cards/CardImageAndQuantity';
import CardFullInfo from '../organisms/cards/CardFullInfo';
import EmptyState from '../organisms/shared/EmptyState';
import { useParams } from 'react-router-dom';
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import Grid from '@mui/material/Grid';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import type { ICard } from '../../interfaces/card.interface';
import SDK from '../../sdk/SDK';
import { BACKEND_URL, CARD_SET_CODE_REGEX, ELEMENT_IDS } from '../../constants';
import {
  setCardsData,
  clearCardsData,
  updateCardCount,
  updateCardWishlist,
  setSelectedCardNumber,
} from '../../stores/cardSlice';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../stores/store';
import CoreInput from '../molecules/CoreInput';
import CardsLoadingScreen from '../organisms/cards/CardsLoadingScreen';
import CardListLoadingSkeleton from '../organisms/cards/CardListLoadingSkeleton';

const CardListFromSet = lazy(
  () => import('../organisms/cards/CardListFromSet'),
);

interface CardsProps {
  socketId: string;
}

const Cards = ({ socketId }: CardsProps) => {
  const sdk = SDK.getInstance(BACKEND_URL);
  const dispatch = useDispatch();
  const { cardNumber: urlCardNumber } = useParams<{ cardNumber?: string }>();

  const cardsList = useSelector((state: RootState) => state.cards.cardsList);
  const cardSetPrefixInStore = useSelector(
    (state: RootState) => state.cards.cardSetPrefix,
  );

  const [searchedCard, setSearchedCard] = useState<ICard | null>(null);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [cardSetName, setCardSetName] = useState<string>('');
  const [showCardSetFetch, setShowCardSetFetch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (searchedCard) {
      const newQuantity = searchedCard.count > 0 ? searchedCard.count : 1;
      setQuantity(newQuantity);
      dispatch(setSelectedCardNumber(searchedCard.cardNumber));
    } else {
      dispatch(setSelectedCardNumber(null));
    }
  }, [searchedCard, dispatch]);

  // Sync searchedCard with Redux state when wishlist changes
  useEffect(() => {
    if (searchedCard && cardsList.length > 0) {
      const updatedCard = cardsList.find(
        (c) =>
          c.cardNumber?.toUpperCase() ===
          searchedCard.cardNumber?.toUpperCase(),
      );
      if (
        updatedCard &&
        updatedCard.wishlistCount !== searchedCard.wishlistCount
      ) {
        setSearchedCard(updatedCard);
      }
    }
  }, [cardsList, searchedCard]);

  const fetchCardSet = useCallback(
    async (cardSetNameValue: string) => {
      try {
        await sdk.cardsManager.findCardSets(
          {
            cardSetNames: [cardSetNameValue],
            cardSetCode: urlCardNumber || '',
          },
          socketId,
        );
        toast.success(
          'Started search — you will be notified when it finishes.',
        );
      } catch (error) {
        console.error('Error fetching card set:', error);
        toast.error('Failed to start search. Please try again.');
      }
    },
    [sdk.cardsManager, socketId, urlCardNumber],
  );

  useEffect(() => {
    const executeSearch = async () => {
      try {
        const cardSetCode = urlCardNumber;
        if (!cardSetCode) {
          dispatch(clearCardsData());
          setShowCardSetFetch(false);
          setIsLoading(false);
          return;
        }

        const normalizedCode = cardSetCode.trim();
        const valid = CARD_SET_CODE_REGEX.test(normalizedCode);
        if (!valid) {
          setIsLoading(false);
          return;
        }

        const setCodePrefix = normalizedCode.split('-')[0];

        if (cardSetPrefixInStore === setCodePrefix && cardsList.length > 0) {
          setIsLoading(false);
          const cardInList = cardsList.find(
            (c) =>
              c?.cardNumber?.toUpperCase() === normalizedCode.toUpperCase(),
          );
          if (cardInList) {
            setSearchedCard(cardInList);
            setShowCardSetFetch(false);
          } else {
            setSearchedCard(null);
            setShowCardSetFetch(true);
          }
          return;
        }

        setIsLoading(true);
        const cards = await sdk.cardsManager.getCardsBySetCode(normalizedCode);

        const validCards = cards.filter(
          (c): c is ICard => c != null && c.cardNumber != null,
        );

        dispatch(
          setCardsData({ cardSetPrefix: setCodePrefix, cardsList: validCards }),
        );
        const searchedCard = validCards.find(
          (c) => c.cardNumber.toUpperCase() === normalizedCode.toUpperCase(),
        );
        if (!searchedCard) {
          toast.error('Card not found in the fetched set.');
          setSearchedCard(null);
          setShowCardSetFetch(false);
          return;
        }

        setSearchedCard(searchedCard);
        setShowCardSetFetch(false);
      } catch (error) {
        const err = error as {
          response?: { data?: { statusCode?: number; message?: string } };
        };
        if (
          err?.response?.data?.statusCode === 404 &&
          err?.response?.data?.message?.toLowerCase().includes('not found')
        ) {
          setShowCardSetFetch(true);
        } else {
          console.error('Error fetching cards:', error);
          toast.error('Error fetching cards.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCardNumber]);

  const onSubmit = async () => {
    if (!searchedCard) return;
    try {
      const quantityToAdd = Number(quantity);
      await sdk.cardsManager.addCardToCollection(
        searchedCard.cardNumber,
        quantityToAdd,
      );

      dispatch(
        updateCardCount({ cardId: searchedCard.id, count: quantityToAdd }),
      );
      setSearchedCard({ ...searchedCard, count: quantityToAdd });

      toast.success(
        `New quantity set to your collection: ${quantityToAdd} x ${searchedCard.name}`,
      );
    } catch (error) {
      console.error('Error adding card to collection:', error);
      toast.error('Failed to add card to collection. Please try again.');
    }
  };

  const handleAddToWishlist = async (wishlistQuantity: number) => {
    if (!searchedCard) return;
    try {
      await sdk.cardsManager.addCardToWishlist(
        searchedCard.cardNumber,
        wishlistQuantity,
      );

      setSearchedCard({
        ...searchedCard,
        wishlistCount: wishlistQuantity,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: searchedCard.cardNumber,
          wishlistCount: wishlistQuantity,
        }),
      );

      toast.success(
        `Added to wishlist: ${wishlistQuantity} x ${searchedCard.name}`,
      );
    } catch (error) {
      console.error('Error adding card to wishlist:', error);
      toast.error('Failed to add card to wishlist. Please try again.');
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!searchedCard) return;
    try {
      await sdk.cardsManager.removeCardFromWishlist(searchedCard.cardNumber);

      setSearchedCard({
        ...searchedCard,
        wishlistCount: 0,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: searchedCard.cardNumber,
          wishlistCount: 0,
        }),
      );

      toast.success(`Removed from wishlist: ${searchedCard.name}`);
    } catch (error) {
      console.error('Error removing card from wishlist:', error);
      toast.error('Failed to remove card from wishlist. Please try again.');
    }
  };

  if (isLoading) return <CardsLoadingScreen />;

  if (showCardSetFetch) {
    return (
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <EmptyState
          title="Find Card Set"
          description={`We couldn't find the card set you're looking for. Would you like to\n\rprovide the card set name for the card with set code: ${urlCardNumber}?`}
          callback={() => {
            const searchBar = document.getElementById(
              ELEMENT_IDS.CARD_SET_NAME_INPUT,
            );
            searchBar?.focus();
          }}
          custom={() => (
            <Grid
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2,
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <CoreInput
                label={ELEMENT_IDS.CARD_SET_NAME_INPUT}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCardSetName(e.target.value)
                }
                value={cardSetName}
              />
              <Button
                variant="contained"
                sx={{ width: '100%' }}
                onClick={async () => {
                  if (!cardSetName) return;
                  await fetchCardSet(cardSetName);
                }}
              >
                Search
              </Button>
            </Grid>
          )}
        />
      </Grid>
    );
  }

  if (!cardsList.length) {
    return (
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <EmptyState
          title="Search for Yu-Gi-Oh! Cards"
          description={`Use the search bar above to find cards and add them to your collection.\n\rExplore thousands of cards from different sets and rarities.`}
          callback={() => {
            const searchBar = document.getElementById(
              ELEMENT_IDS.CARD_SEARCH_INPUT,
            );
            searchBar?.focus();
          }}
        />
      </Grid>
    );
  }

  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: { xs: 2, sm: 4 },
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        padding: { xs: 1, sm: 2 },
      }}
    >
      <CardImageAndQuantity
        card={searchedCard}
        quantity={quantity}
        setQuantity={setQuantity}
        onSubmit={onSubmit}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      />
      <CardFullInfo card={searchedCard} />
      <Suspense fallback={<CardListLoadingSkeleton />}>
        <CardListFromSet />
      </Suspense>
    </Grid>
  );
};

export default Cards;
