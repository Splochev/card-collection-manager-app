import {
  Box,
  Typography,
  Card as MuiCard,
  CardContent,
  Button,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Launch as LaunchIcon,
  ShoppingCart as ShoppingCartIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import type { ICard } from '../../../interfaces/card.interface';
import SDK from '../../../sdk/SDK';
import { BACKEND_URL } from '../../../constants';
import { toast } from 'react-toastify';
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateCardCount } from '../../../stores/collectionSlice';
import { useNavigate } from 'react-router-dom';

interface CollectionCardGridItemProps {
  card: ICard;
}

const sdk = SDK.getInstance(BACKEND_URL);

const buttonStyle = {
  minWidth: 0,
  padding: 0,
  width: 'fit-content',
  height: 'fit-content',
  borderRadius: 1.5,
};

const CollectionCardGridItem = ({ card }: CollectionCardGridItemProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [localCount, setLocalCount] = useState(card.count);
  const [zoomOpen, setZoomOpen] = useState(false);
  const holdInterval = useRef<number | null>(null);
  const holdAction = useRef<(() => void) | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cards/${card.cardNumber}`);
  };

  const handleZoomOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomOpen(true);
  };

  const handleZoomClose = () => setZoomOpen(false);

  const handleDecrement = () => {
    setLocalCount((prev) => Math.max(0, prev - 1));
  };

  const handleIncrement = () => {
    setLocalCount((prev) => prev + 1);
  };

  const startHold = (action: () => void) => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
    }

    holdAction.current = action;
    action();

    let speed = 120;
    let elapsed = 0;

    holdInterval.current = window.setInterval(() => {
      elapsed += speed;

      if (holdAction.current) holdAction.current();

      if (elapsed >= 1500 && speed === 120) {
        speed = 40;
        clearInterval(holdInterval.current!);
        holdInterval.current = window.setInterval(() => {
          if (holdAction.current) holdAction.current();
        }, speed);
      }
    }, speed);
  };

  const stopHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
      holdAction.current = null;
    }
  };

  useEffect(() => {
    setLocalCount(card.count);
  }, [card.count]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      if (localCount !== card.count) {
        try {
          await sdk.cardsManager.addCardToCollection(
            card.cardNumber,
            localCount,
          );
          dispatch(
            updateCardCount({
              cardId: card.id,
              cardNumber: card.cardNumber,
              newCount: localCount,
            }),
          );

          if (localCount === 0) {
            toast.info(`Removed ${card.name} from collection`);
          } else {
            toast.success(`Updated ${card.name} to ${localCount}x`);
          }
        } catch (error) {
          console.error('Error updating card count:', error);
          toast.error('Failed to update card count');
          setLocalCount(card.count);
        }
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localCount, card.count, card.cardNumber, card.id, card.name, dispatch]);

  useEffect(() => {
    return () => {
      if (holdInterval.current) {
        clearInterval(holdInterval.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  console.log(card);

  return (
    <>
      <MuiCard
        sx={{
          width: { xs: 140, sm: 160, md: 200 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '146%',
            backgroundColor: 'action.hover',
          }}
        >
          <Box
            component="img"
            src={card.imageUrl || ''}
            alt={card.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <CardContent sx={{ padding: 1, '&:last-child': { paddingBottom: 1 } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={card.name}
          >
            {card.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 0.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              title={card.cardNumber}
            >
              {card.cardNumber}
            </Typography>
            <Typography
              variant="body1"
              color="primary"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                marginLeft: 1,
              }}
            >
              {localCount}x
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
              marginTop: 0.5,
            }}
          >
            <Button
              disabled={localCount === 0}
              sx={buttonStyle}
              onMouseDown={() => startHold(handleDecrement)}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(handleDecrement)}
              onTouchEnd={stopHold}
            >
              <Paper elevation={4} sx={{ padding: 0.5, borderRadius: 1.5 }}>
                <RemoveIcon fontSize="small" />
              </Paper>
            </Button>
            <Button
              sx={buttonStyle}
              onMouseDown={() => startHold(handleIncrement)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(handleIncrement)}
              onTouchEnd={stopHold}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Paper elevation={4} sx={{ padding: 0.5, borderRadius: 1.5 }}>
                <AddIcon fontSize="small" />
              </Paper>
            </Button>
            <Button
              sx={buttonStyle}
              href={card.marketURL}
              component="a"
              target="_blank"
            >
              <Paper elevation={4} sx={{ padding: 0.5, borderRadius: 1.5 }}>
                <ShoppingCartIcon fontSize="small" />
              </Paper>
            </Button>
            <Button
              sx={buttonStyle}
              component="a"
              href={`/cards/${card.cardNumber}`}
              onClick={handleNavigate}
            >
              <Paper elevation={4} sx={{ padding: 0.5, borderRadius: 1.5 }}>
                <LaunchIcon fontSize="small" />
              </Paper>
            </Button>
            <Button
              sx={buttonStyle}
              onClick={handleZoomOpen}
              aria-label="Zoom in"
            >
              <Paper elevation={4} sx={{ padding: 0.5, borderRadius: 1.5 }}>
                <ZoomInIcon fontSize="small" />
              </Paper>
            </Button>
          </Box>
        </CardContent>
      </MuiCard>
      <Dialog open={zoomOpen} onClose={handleZoomClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#222',
          }}
        >
          <Box
            component="img"
            src={card.imageUrl || ''}
            alt={card.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '70vh',
              borderRadius: 2,
              boxShadow: 6,
              background: '#222',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollectionCardGridItem;
