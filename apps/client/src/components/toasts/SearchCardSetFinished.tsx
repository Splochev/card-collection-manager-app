import { Button, Grid, Typography } from '@mui/material';
import { body2TypographyProps } from '../../constants';

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
      <Typography {...body2TypographyProps}>
        Finished search for "{collectionName}".
      </Typography>
      <Button variant="text" href={`/cards/${cardSetCode}`} sx={STYLES.button}>
        View
      </Button>
    </Grid>
  );
};

export default SearchCardSetFinished;
