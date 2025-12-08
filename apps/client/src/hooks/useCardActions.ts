import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import type { ICard } from '@card-collection-manager-app/shared';
import { useCardsManager } from '../contexts/SDKContext';
import { updateCardCount, updateCardWishlist } from '../stores/cardSlice';

export interface UseCardActionsProps {
  searchedCard: ICard | null;
  setSearchedCard: React.Dispatch<React.SetStateAction<ICard | null>>;
}

export interface UseCardActionsResult {
  quantity: number | '';
  setQuantity: React.Dispatch<React.SetStateAction<number | ''>>;
  onSubmit: () => Promise<void>;
  handleAddToWishlist: (wishlistQuantity: number) => Promise<void>;
  handleRemoveFromWishlist: () => Promise<void>;
}

/**
 * Hook to handle card collection and wishlist actions.
 * Extracts the card action logic from the Cards page for better testability.
 *
 * @example
 * const {
 *   quantity,
 *   setQuantity,
 *   onSubmit,
 *   handleAddToWishlist,
 *   handleRemoveFromWishlist,
 * } = useCardActions({ searchedCard, setSearchedCard });
 */
export function useCardActions({
  searchedCard,
  setSearchedCard,
}: UseCardActionsProps): UseCardActionsResult {
  const dispatch = useDispatch();
  const cardsManager = useCardsManager();
  const [quantity, setQuantity] = useState<number | ''>(1);

  // Update quantity when searched card changes
  useEffect(() => {
    if (searchedCard) {
      const newQuantity = searchedCard.count > 0 ? searchedCard.count : 1;
      setQuantity(newQuantity);
    }
  }, [searchedCard]);

  const onSubmit = useCallback(async () => {
    if (!searchedCard) return;

    try {
      const quantityToAdd = Number(quantity);
      await cardsManager.addCardToCollection(
        searchedCard.cardNumber,
        quantityToAdd
      );

      dispatch(
        updateCardCount({ cardId: searchedCard.id, count: quantityToAdd })
      );
      setSearchedCard({ ...searchedCard, count: quantityToAdd });

      toast.success(
        `New quantity set to your collection: ${quantityToAdd} x ${searchedCard.name}`
      );
    } catch (error) {
      console.error('Error adding card to collection:', error);
      toast.error('Failed to add card to collection. Please try again.');
    }
  }, [searchedCard, quantity, cardsManager, dispatch, setSearchedCard]);

  const handleAddToWishlist = useCallback(
    async (wishlistQuantity: number) => {
      if (!searchedCard) return;

      try {
        await cardsManager.addCardToWishlist(
          searchedCard.cardNumber,
          wishlistQuantity
        );

        setSearchedCard({
          ...searchedCard,
          wishlistCount: wishlistQuantity,
        });

        dispatch(
          updateCardWishlist({
            cardNumber: searchedCard.cardNumber,
            wishlistCount: wishlistQuantity,
          })
        );

        toast.success(
          `Added to wishlist: ${wishlistQuantity} x ${searchedCard.name}`
        );
      } catch (error) {
        console.error('Error adding card to wishlist:', error);
        toast.error('Failed to add card to wishlist. Please try again.');
      }
    },
    [searchedCard, cardsManager, dispatch, setSearchedCard]
  );

  const handleRemoveFromWishlist = useCallback(async () => {
    if (!searchedCard) return;

    try {
      await cardsManager.removeCardFromWishlist(searchedCard.cardNumber);

      setSearchedCard({
        ...searchedCard,
        wishlistCount: 0,
      });

      dispatch(
        updateCardWishlist({
          cardNumber: searchedCard.cardNumber,
          wishlistCount: 0,
        })
      );

      toast.success(`Removed from wishlist: ${searchedCard.name}`);
    } catch (error) {
      console.error('Error removing card from wishlist:', error);
      toast.error('Failed to remove card from wishlist. Please try again.');
    }
  }, [searchedCard, cardsManager, dispatch, setSearchedCard]);

  return {
    quantity,
    setQuantity,
    onSubmit,
    handleAddToWishlist,
    handleRemoveFromWishlist,
  };
}

export default useCardActions;
