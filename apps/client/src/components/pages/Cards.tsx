import CardImageAndQuantity from '../organisms/cards/CardImageAndQuantity';
import CardFullInfo from '../organisms/cards/CardFullInfo';
import EmptyState from '../organisms/shared/EmptyState';
import { useState, lazy, Suspense } from 'react';
import Grid from '@mui/material/Grid';
import { ELEMENT_IDS } from '../../constants';
import { useCardSearch } from '../../hooks/useCardSearch';
import { useCardActions } from '../../hooks/useCardActions';
import CardsLoadingScreen from '../organisms/cards/CardsLoadingScreen';
import CardListLoadingSkeleton from '../organisms/cards/CardListLoadingSkeleton';
import NoCardFound from '../organisms/cards/NoCardFound';

const CardListFromSet = lazy(
  () => import('../organisms/cards/CardListFromSet')
);

const STYLES = {
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    padding: 2,
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: { xs: 2, sm: 4 },
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    padding: { xs: 1, sm: 2 },
  },
};

export interface CardsProps {
  socketId: string;
}

const Cards = ({ socketId }: CardsProps) => {
  const [cardSetName, setCardSetName] = useState<string>('');
  const {
    searchedCard,
    setSearchedCard,
    cardsList,
    isLoading,
    showCardSetFetch,
    urlCardNumber,
    fetchCardSet,
  } = useCardSearch();
  const {
    quantity,
    setQuantity,
    onSubmit,
    handleAddToWishlist,
    handleRemoveFromWishlist,
  } = useCardActions({ searchedCard, setSearchedCard });

  const handleFetchCardSet = async (cardSetNameValue: string) => {
    await fetchCardSet(cardSetNameValue, socketId);
  };

  switch (true) {
    case isLoading:
      return <CardsLoadingScreen />;
    case showCardSetFetch:
      return (
        <NoCardFound
          setCardSetName={setCardSetName}
          cardSetName={cardSetName}
          urlCardNumber={urlCardNumber}
          fetchCardSet={handleFetchCardSet}
        />
      );
    case Boolean(!cardsList.length):
      return (
        <Grid sx={STYLES.emptyStateContainer}>
          <EmptyState
            title="Search for Yu-Gi-Oh! Cards"
            description={`Use the search bar above to find cards and add them to your collection.\n\rExplore thousands of cards from different sets and rarities.`}
            callback={() => {
              const searchBar = document.getElementById(
                ELEMENT_IDS.CARD_SEARCH_INPUT
              );
              searchBar?.focus();
            }}
          />
        </Grid>
      );
    default:
      return (
        <Grid sx={STYLES.pageContainer}>
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
  }
};

export default Cards;
