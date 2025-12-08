import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import type { RootState } from '../../stores/store';
import { useCollection } from '../../hooks/useCollection';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { t } from '../../constants';
import CollectionToolbar from '../organisms/collection/CollectionToolbar';
import CollectionCardGridItem from '../organisms/collection/CollectionCardGridItem';
import CollectionCardListItem from '../organisms/collection/CollectionCardListItem';
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

const Collection = () => {
  const [zoomInCard, setZoomInCard] = useState<ICard | null>(null);
  const { groups, viewMode } = useSelector(
    (state: RootState) => state.collection
  );
  const {
    isLoading,
    hasMore,
    hasActiveFilter,
    handleRefresh,
    loadMore,
  } = useCollection();
  const { observerTarget } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
  });

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
                <Typography {...t.h5} sx={STYLES.groupKey}>
                  {group.groupKey}
                  <Typography {...t.p.body2} sx={STYLES.groupCardsCount}>
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
