import { useEffect, useCallback, useRef } from 'react';
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
import { BACKEND_URL } from '../../constants';
import CollectionToolbar from '../organisms/collection/CollectionToolbar';
import CollectionCardGridItem from '../organisms/collection/CollectionCardGridItem';
import CollectionCardListItem from '../organisms/collection/CollectionCardListItem';
import EmptyState from '../organisms/shared/EmptyState';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearchParams } from 'react-router-dom';

const sdk = SDK.getInstance(BACKEND_URL);

const Collection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    [dispatch, filter, urlFilter, limit, offset, groupBy, orderBy, sortType]
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
      { threshold: 0.1 }
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
        {hasActiveFilter ? (
          <EmptyState
            title="No cards found"
            description="No cards in your collection match the current search criteria. Try adjusting your search or clear the filter."
            callback={() => {
              setTimeout(() => {
                const searchLabel =
                  'Find cards in collection by card name, set number or set name';
                const searchInput = document.getElementById(searchLabel);
                if (searchInput) {
                  searchInput.focus();
                }
              }, 100);
            }}
          />
        ) : (
          <EmptyState
            title="Your collection is empty"
            description="Start adding cards to your collection from the Cards page!"
            callback={() => {
              navigate('/cards');
            }}
          />
        )}
      </Grid>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <CollectionToolbar onRefresh={handleRefresh} />
      <Box
        sx={{
          paddingX: { xs: 1, sm: 2 },
          paddingBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '1400px' }}>
          {groups.map((group) => (
            <Box key={group.groupKey} sx={{ marginBottom: 4 }}>
              {/* Group Header */}
              <Typography
                variant="h5"
                sx={{
                  marginBottom: 2,
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {group.groupKey}{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  ({group.cards.length} card
                  {group.cards.length !== 1 ? 's' : ''})
                </Typography>
              </Typography>

              {/* Cards Grid/List */}
              {viewMode === 'grid' ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                      sm: 'repeat(auto-fill, minmax(160px, 1fr))',
                      md: 'repeat(auto-fill, minmax(200px, 1fr))',
                    },
                    gap: { xs: 1, sm: 2 },
                    justifyItems: 'center',
                  }}
                >
                  {group.cards.map((card, index) => (
                    <CollectionCardGridItem
                      key={`collection-card-grid-item-${card.id}-${card.cardNumber}-${index}`}
                      card={card}
                    />
                  ))}
                </Box>
              ) : (
                <Box>
                  {group.cards.map((card, index) => (
                    <CollectionCardListItem
                      key={`collection-card-list-item-${card.id}-${card.cardNumber}-${index}`}
                      card={card}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {/* Infinite Scroll Trigger */}
          <Box
            ref={observerTarget}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              padding: 3,
              minHeight: 100,
            }}
          >
            {isLoading && <CircularProgress />}
          </Box>

          {!hasMore && groups.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ marginTop: 2 }}
            >
              You've reached the end of your collection
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Collection;
