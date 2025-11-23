import { Grid } from '@mui/material';
import EmptyState from '../shared/EmptyState';
import { useNavigate } from 'react-router-dom';

const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    padding: 2,
  },
};

const NoCardFound = ({ hasActiveFilter }: { hasActiveFilter: boolean }) => {
  const navigate = useNavigate();
  return (
    <Grid sx={STYLES.container}>
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
};

export default NoCardFound;
