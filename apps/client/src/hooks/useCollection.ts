import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useCardsManager } from '../contexts/SDKContext';
import type { RootState } from '../stores/store';
import {
  setGroups,
  appendGroups,
  setTotalGroups,
  setHasMore,
  setIsLoading,
  incrementOffset,
  resetCollection,
} from '../stores/collectionSlice';

export interface UseCollectionResult {
  /**
   * Whether data is currently being fetched.
   */
  isLoading: boolean;
  /**
   * Whether there are more groups to load.
   */
  hasMore: boolean;
  /**
   * Whether there's an active filter (from URL or state).
   */
  hasActiveFilter: boolean;
  /**
   * Fetches collection data. If append is true, appends to existing data.
   */
  fetchCollection: (append?: boolean) => Promise<void>;
  /**
   * Resets collection and fetches fresh data.
   */
  handleRefresh: () => void;
  /**
   * Loads more data (increments offset and fetches).
   */
  loadMore: () => void;
}

/**
 * Hook to handle collection data fetching and state management.
 * Extracts the collection logic from the Collection page for better testability.
 *
 * @example
 * const {
 *   isLoading,
 *   hasMore,
 *   fetchCollection,
 *   handleRefresh,
 *   loadMore,
 * } = useCollection();
 */
export function useCollection(): UseCollectionResult {
  const dispatch = useDispatch();
  const cardsManager = useCardsManager();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter') || '';

  const {
    groupBy,
    orderBy,
    sortType,
    filter,
    offset,
    limit,
    hasMore,
    isLoading,
  } = useSelector((state: RootState) => state.collection);

  const hasActiveFilter = Boolean(urlFilter || filter);

  const fetchCollection = useCallback(
    async (append = false) => {
      dispatch(setIsLoading(true));
      try {
        const response = await cardsManager.getMyCollection({
          filter: urlFilter || filter,
          limit,
          offset: append ? offset : 0,
          groupBy,
          orderBy,
          sortType,
        });

        if (append) {
          dispatch(appendGroups(response.groups));
        } else {
          dispatch(setGroups(response.groups));
        }
        dispatch(setTotalGroups(response.totalGroups));
        dispatch(setHasMore(response.hasMore));
      } catch (error) {
        console.error('Failed to fetch collection:', error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [
      dispatch,
      cardsManager,
      filter,
      urlFilter,
      limit,
      offset,
      groupBy,
      orderBy,
      sortType,
    ]
  );

  const handleRefresh = useCallback(() => {
    dispatch(resetCollection());
    fetchCollection(false);
  }, [dispatch, fetchCollection]);

  const loadMore = useCallback(() => {
    dispatch(incrementOffset());
    fetchCollection(true);
  }, [dispatch, fetchCollection]);

  // Reset and fetch when filters/sorting change
  useEffect(() => {
    dispatch(resetCollection());
    fetchCollection(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, orderBy, sortType, urlFilter]);

  return {
    isLoading,
    hasMore,
    hasActiveFilter,
    fetchCollection,
    handleRefresh,
    loadMore,
  };
}

export default useCollection;
