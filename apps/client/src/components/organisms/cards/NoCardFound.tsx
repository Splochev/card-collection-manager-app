import { Grid } from '@mui/material';
import EmptyState from '../shared/EmptyState';
import CoreInput from '../../molecules/CoreInput';
import { Button } from '@mui/material';
import { ELEMENT_IDS } from './../../../constants';

const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    padding: 2,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 2,
    width: '100%',
    maxWidth: '500px',
  },
  button: { width: '100%' },
};

const NoCardFound = ({
  setCardSetName,
  cardSetName,
  urlCardNumber,
  fetchCardSet,
}: {
  setCardSetName: (name: string) => void;
  cardSetName: string;
  urlCardNumber: string | undefined;
  fetchCardSet: (name: string) => Promise<void>;
}) => {
  return (
    <Grid sx={STYLES.container}>
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
          <Grid sx={STYLES.inputWrapper}>
            <CoreInput
              label={ELEMENT_IDS.CARD_SET_NAME_INPUT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCardSetName(e.target.value)
              }
              value={cardSetName}
            />
            <Button
              variant="contained"
              sx={STYLES.button}
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
};

export default NoCardFound;
