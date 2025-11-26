import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import type { RootState } from '../../stores/store';
import {
  setGroups,
  appendGroups,
  setTotalGroups,
  setHasMore,
  setIsLoading,
  incrementOffset,
  resetCollection,
} from '../../stores/collectionSlice';
import SDK from '../../sdk/SDK';
import {
  BACKEND_URL,
  body2SpanTypographyProps,
  h5TypographyProps,
} from '../../constants';
import CollectionToolbar from '../organisms/collection/CollectionToolbar';
import CollectionCardGridItem from '../organisms/collection/CollectionCardGridItem';
import CollectionCardListItem from '../organisms/collection/CollectionCardListItem';
import { useSearchParams } from 'react-router-dom';
import type { ICard } from '@card-collection-manager-app/shared';
import NoCardFound from '../organisms/collection/NoCardFound';
import ZoomInCard from '../Dialogs/ZoomInCard';

const STYLES = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  contentContainer: {
    padding: { xs: 1.5, sm: 2 },
    paddingBottom: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    overflowY: 'auto',
    flex: 1,
  },
  groupsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  infiniteScrollTrigger: {
    display: 'flex',
    justifyContent: 'center',
    padding: 3,
    minHeight: 50,
  },
  groupKey: {
    marginBottom: 2,
    fontWeight: 'bold',
    fontSize: { xs: '1.25rem', sm: '1.5rem' },
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'start',
    '@media (max-width: 715px)': {
      gap: 1.5,
    },
    '@media (max-width: 670px)': {
      justifyContent: 'center',
      gap: 4,
    },
    '@media (max-width: 475px)': {
      gap: 1.5,
    },
  },
  groupCardsCount: {
    color: 'text.secondary',
    marginLeft: 1,
  },
};

const sdk = SDK.getInstance(BACKEND_URL);

const Collection = () => {
  const dispatch = useDispatch();
  const [zoomInCard, setZoomInCard] = useState<ICard | null>(null);
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter') || '';

  const {
    groups,
    groupBy,
    orderBy,
    sortType,
    viewMode,
    filter,
    offset,
    limit,
    hasMore,
    isLoading,
  } = useSelector((state: RootState) => state.collection);

  const observerTarget = useRef<HTMLDivElement>(null);
  const hasActiveFilter = Boolean(urlFilter || filter);

  const fetchCollection = useCallback(
    async (append = false) => {
      dispatch(setIsLoading(true));
      try {
        const response = await sdk.cardsManager.getMyCollection({
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
    [dispatch, filter, urlFilter, limit, offset, groupBy, orderBy, sortType],
  );

  const handleRefresh = useCallback(() => {
    dispatch(resetCollection());
    fetchCollection(false);
  }, [dispatch, fetchCollection]);

  useEffect(() => {
    dispatch(resetCollection());
    fetchCollection(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, orderBy, sortType, urlFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          dispatch(incrementOffset());
          fetchCollection(true);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, dispatch, fetchCollection]);

  if (!isLoading && groups.length === 0) {
    return <NoCardFound hasActiveFilter={hasActiveFilter} />;
  }

  return (
    <>
      <Box sx={STYLES.container}>
        <CollectionToolbar onRefresh={handleRefresh} />
        <Box sx={STYLES.contentContainer}>
          <Box sx={STYLES.groupsContainer}>
            {groups.map((group) => (
              <Box key={group.groupKey}>
                <Typography {...h5TypographyProps} sx={STYLES.groupKey}>
                  {group.groupKey}
                  <Typography
                    {...body2SpanTypographyProps}
                    sx={STYLES.groupCardsCount}
                  >
                    ({group.cards.length} card
                    {group.cards.length !== 1 ? 's' : ''})
                  </Typography>
                </Typography>
                {viewMode === 'grid' ? (
                  <Box sx={STYLES.grid}>
                    {group.cards.map((card, index) => (
                      <CollectionCardGridItem
                        key={`collection-card-grid-item-${card.id}-${card.cardNumber}-${index}`}
                        card={card}
                        onZoomIn={setZoomInCard}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box>
                    {group.cards.map((card, index) => (
                      <CollectionCardListItem
                        key={`collection-card-list-item-${card.id}-${card.cardNumber}-${index}`}
                        card={card}
                        onZoomIn={setZoomInCard}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            <Box ref={observerTarget} sx={STYLES.infiniteScrollTrigger}>
              {isLoading && <CircularProgress />}
            </Box>
          </Box>
        </Box>
      </Box>
      <ZoomInCard zoomInCard={zoomInCard} setZoomInCard={setZoomInCard} />
    </>
  );
};

export default Collection;
