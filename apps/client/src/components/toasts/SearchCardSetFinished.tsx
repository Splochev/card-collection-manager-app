import { Button, Grid, Typography } from '@mui/material';

const STYLES = {
  gridContainer: { display: 'flex', gap: 1, alignItems: 'start', marginTop: 1 },
  button: { width: 80 },
};

const SearchCardSetFinished = ({
  collectionName,
  cardSetCode,
}: {
  collectionName: string;
  cardSetCode: string;
}) => {
  return (
    <Grid sx={STYLES.gridContainer}>
      <Typography variant="body2">
        Finished search for "{collectionName}".
      </Typography>
      <Button variant="text" href={`/cards/${cardSetCode}`} sx={STYLES.button}>
        View
      </Button>
    </Grid>
  );
};

export default SearchCardSetFinished;
