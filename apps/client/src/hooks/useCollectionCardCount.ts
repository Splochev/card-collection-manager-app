import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import type { ICard } from '@card-collection-manager-app/shared';
import { useCardsManager } from '../contexts/SDKContext';
import { updateCardCount } from '../stores/collectionSlice';

export interface UseCollectionCardCountOptions {
  /**
   * Optional callback for custom toast messages.
   * Useful for testing to avoid toast side effects.
   */
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

export interface UseCollectionCardCountResult {
  /**
   * The local count that tracks pending changes.
   */
  localCount: number;
  /**
   * Updates the local count, triggering a sync with the server.
   */
  setLocalCount: (value: number | '') => void;
  /**
   * The visible count for immediate UI feedback.
   */
  visibleCount: number;
  /**
   * Updates the visible count for immediate UI feedback.
   */
  setVisibleCount: (value: number) => void;
}

/**
 * Hook to manage card count updates in the collection.
 * Handles local state, server sync, and Redux store updates.
 *
 * This hook extracts the shared logic from CollectionCardGridItem and
 * CollectionCardListItem for better testability and code reuse.
 *
 * @example
 * const { localCount, setLocalCount, visibleCount, setVisibleCount } =
 *   useCollectionCardCount(card);
 *
 * @example
 * // Testing with custom handlers
 * const { localCount, setLocalCount } = useCollectionCardCount(card, {
 *   onSuccess: jest.fn(),
 *   onError: jest.fn(),
 * });
 */
export function useCollectionCardCount(
  card: ICard,
  options: UseCollectionCardCountOptions = {}
): UseCollectionCardCountResult {
  const {
    onSuccess = (msg) => toast.success(msg),
    onError = (msg) => toast.error(msg),
    onInfo = (msg) => toast.info(msg),
  } = options;

  const dispatch = useDispatch();
  const cardsManager = useCardsManager();
  const [localCount, setLocalCountState] = useState(card.count);
  const [visibleCount, setVisibleCount] = useState(card.count);

  // Sync local count when card prop changes
  useEffect(() => {
    setLocalCountState(card.count);
  }, [card.count]);

  // Handle local count changes - sync to server
  useEffect(() => {
    const updateCard = async () => {
      if (localCount !== card.count) {
        try {
          await cardsManager.addCardToCollection(card.cardNumber, localCount);
          dispatch(
            updateCardCount({
              cardId: card.id,
              cardNumber: card.cardNumber,
              newCount: localCount,
            })
          );

          if (localCount === 0) {
            onInfo(`Removed ${card.name} from collection`);
          } else {
            onSuccess(`Updated ${card.name} to ${localCount}x`);
          }
        } catch (error) {
          console.error('Error updating card count:', error);
          onError('Failed to update card count');
          setLocalCountState(card.count);
        }
      }
    };
    updateCard();
  }, [
    localCount,
    card.count,
    card.cardNumber,
    card.id,
    card.name,
    cardsManager,
    dispatch,
    onSuccess,
    onError,
    onInfo,
  ]);

  const setLocalCount = useCallback((value: number | '') => {
    setLocalCountState(Number(value));
  }, []);

  return {
    localCount,
    setLocalCount,
    visibleCount,
    setVisibleCount,
  };
}

export default useCollectionCardCount;
