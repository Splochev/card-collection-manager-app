import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CardFullInfo from '../organisms/cards/CardFullInfo';
import CardWrapper from '../atoms/CardWrapper';
import type { ICard } from '@card-collection-manager-app/shared';

const STYLES = {
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#222',
    overflow: 'visible',
    gap: 4,
  },
  cardWrapperBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const ZoomInCard = ({
  zoomInCard,
  setZoomInCard,
}: {
  zoomInCard: ICard | null;
  setZoomInCard: React.Dispatch<React.SetStateAction<ICard | null>>;
}) => {
  return (
    <Dialog
      open={Boolean(zoomInCard)}
      onClose={() => setZoomInCard(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent sx={{ ...STYLES.dialogContent, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={() => setZoomInCard(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={STYLES.cardWrapperBox}>
          <CardWrapper
            url={zoomInCard?.imageUrl || undefined}
            name={zoomInCard?.name || undefined}
            card={zoomInCard}
          />
        </Box>
        <CardFullInfo card={zoomInCard} removeScroll showAll />
      </DialogContent>
    </Dialog>
  );
};

export default ZoomInCard;
