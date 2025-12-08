import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { ICard } from '@card-collection-manager-app/shared';
import { useCardsManager } from '../contexts/SDKContext';
import {
  setCardsData,
  clearCardsData,
  setSelectedCardNumber,
} from '../stores/cardSlice';
import type { RootState } from '../stores/store';
import { CARD_SET_CODE_REGEX } from '../constants';

export interface UseCardSearchResult {
  searchedCard: ICard | null;
  setSearchedCard: React.Dispatch<React.SetStateAction<ICard | null>>;
  cardsList: ICard[];
  isLoading: boolean;
  showCardSetFetch: boolean;
  urlCardNumber: string | undefined;
  fetchCardSet: (cardSetName: string, socketId: string) => Promise<void>;
}

/**
 * Hook to handle card search functionality.
 * Extracts the card search logic from the Cards page for better testability.
 *
 * @example
 * const {
 *   searchedCard,
 *   isLoading,
 *   showCardSetFetch,
 *   fetchCardSet,
 * } = useCardSearch();
 */
export function useCardSearch(): UseCardSearchResult {
  const dispatch = useDispatch();
  const cardsManager = useCardsManager();
  const { cardNumber: urlCardNumber } = useParams<{ cardNumber?: string }>();

  const cardsList = useSelector((state: RootState) => state.cards.cardsList);
  const cardSetPrefixInStore = useSelector(
    (state: RootState) => state.cards.cardSetPrefix
  );

  const [searchedCard, setSearchedCard] = useState<ICard | null>(null);
  const [showCardSetFetch, setShowCardSetFetch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync selected card number with store
  useEffect(() => {
    if (searchedCard) {
      dispatch(setSelectedCardNumber(searchedCard.cardNumber));
    } else {
      dispatch(setSelectedCardNumber(null));
    }
  }, [searchedCard, dispatch]);

  // Update searched card when wishlist count changes
  useEffect(() => {
    if (searchedCard && cardsList.length > 0) {
      const updatedCard = cardsList.find(
        (c) =>
          c.cardNumber?.toUpperCase() ===
          searchedCard.cardNumber?.toUpperCase()
      );
      if (
        updatedCard &&
        updatedCard.wishlistCount !== searchedCard.wishlistCount
      ) {
        setSearchedCard(updatedCard);
      }
    }
  }, [cardsList, searchedCard]);

  // Main search effect
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

        // Check if cards are already in store
        if (cardSetPrefixInStore === setCodePrefix && cardsList.length > 0) {
          setIsLoading(false);
          const cardInList = cardsList.find(
            (c) =>
              c?.cardNumber?.toUpperCase() === normalizedCode.toUpperCase()
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
        const cards = await cardsManager.getCardsBySetCode(normalizedCode);

        const validCards = cards.filter(
          (c): c is ICard => c != null && c.cardNumber != null
        );

        dispatch(
          setCardsData({ cardSetPrefix: setCodePrefix, cardsList: validCards })
        );

        const foundCard = validCards.find(
          (c) => c.cardNumber.toUpperCase() === normalizedCode.toUpperCase()
        );

        if (!foundCard) {
          toast.error('Card not found in the fetched set.');
          setSearchedCard(null);
          setShowCardSetFetch(false);
          return;
        }

        setSearchedCard(foundCard);
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

  const fetchCardSet = useCallback(
    async (cardSetName: string, socketId: string) => {
      try {
        await cardsManager.findCardSets(
          {
            cardSetNames: [cardSetName],
            cardSetCode: urlCardNumber || '',
          },
          socketId
        );
        toast.success(
          'Started search — you will be notified when it finishes.'
        );
      } catch (error) {
        console.error('Error fetching card set:', error);
        toast.error('Failed to start search. Please try again.');
      }
    },
    [cardsManager, urlCardNumber]
  );

  return {
    searchedCard,
    setSearchedCard,
    cardsList,
    isLoading,
    showCardSetFetch,
    urlCardNumber,
    fetchCardSet,
  };
}

export default useCardSearch;
