import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { ICard } from '../../../interfaces/card.interface';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

interface WishlistManagerProps {
  card: ICard | null;
  onAddToWishlist: (quantity: number) => Promise<void>;
  onRemoveFromWishlist: () => Promise<void>;
  variant?: 'full' | 'icon-only';
  isOpen?: boolean;
  onToggle?: () => void;
}

const buttonStyle = {
  minWidth: 0,
  padding: 0,
  width: 'fit-content',
  height: 'fit-content',
  borderRadius: 2.5,
};

const WishlistManager = ({
  card,
  onAddToWishlist,
  onRemoveFromWishlist,
  variant = 'full',
  isOpen = false,
  onToggle,
}: WishlistManagerProps) => {
  const [wishlistQuantity, setWishlistQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const holdInterval = useRef<number | null>(null);
  const holdAction = useRef<(() => void) | null>(null);

  const isInWishlist = card?.wishlistCount && card.wishlistCount > 0;

  const handleWishlistClick = () => {
    if (isInWishlist) {
      // Remove from wishlist
      handleRemove();
    } else {
      // Show quantity input
      onToggle?.();
    }
  };

  const handleAddWithQuantity = async () => {
    if (!card) return;

    // If quantity is 0, remove from wishlist
    if (wishlistQuantity === 0) {
      await handleRemove();
      onToggle?.();
      setWishlistQuantity(1);
      return;
    }

    if (wishlistQuantity <= 0) return;
    setIsLoading(true);
    try {
      await onAddToWishlist(wishlistQuantity);
      onToggle?.();
      setWishlistQuantity(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!card) return;
    setIsLoading(true);
    try {
      await onRemoveFromWishlist();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onToggle?.();
    setWishlistQuantity(1);
  };

  const handleDecrement = () => {
    setWishlistQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleIncrement = () => {
    setWishlistQuantity((prev) => Math.min(100, prev + 1));
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
    return () => {
      if (holdInterval.current) {
        clearInterval(holdInterval.current);
      }
    };
  }, []);

  if (!card) {
    return null;
  }

  // For icon-only variant, only show the icon button
  if (variant === 'icon-only' && !isOpen) {
    return (
      <IconButton
        onClick={handleWishlistClick}
        disabled={isLoading}
        color={isInWishlist ? 'error' : 'default'}
        size="small"
        sx={{
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    );
  }

  if (isOpen) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: { xs: 0.6, sm: 1 },
          mb: 1,
          backgroundColor: 'background.paper',
          padding: { xs: 0.9, sm: 1.5 },
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          flexWrap: 'wrap',
          boxSizing: 'border-box',
        }}
      >
        <Typography
          variant="body1"
          component="h3"
          sx={{
            fontSize: { xs: '0.8rem', sm: '1rem' },
            minWidth: 0,
            flexShrink: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '0 1 auto',
          }}
        >
          {isInWishlist ? `Wishlisted: ${card.wishlistCount}` : 'Wishlist card'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Button
            disabled={isLoading || wishlistQuantity <= 0}
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
            <Paper
              elevation={10}
              sx={{ padding: { xs: 0.5, sm: 0.9 }, borderRadius: 2.5 }}
            >
              <RemoveIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }} />
            </Paper>
          </Button>
          <TextField
            type="number"
            value={wishlistQuantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) {
                setWishlistQuantity(val);
              }
            }}
            size="small"
            inputProps={{ min: 0, max: 100 }}
            sx={{ width: { xs: 65, sm: 90 } }}
          />
          <Button
            disabled={isLoading || wishlistQuantity >= 100}
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
            <Paper
              elevation={10}
              sx={{ padding: { xs: 0.5, sm: 0.9 }, borderRadius: 2.5 }}
            >
              <AddIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }} />
            </Paper>
          </Button>
          <IconButton
            size="small"
            onClick={handleAddWithQuantity}
            disabled={isLoading}
            sx={{ padding: { xs: 0.6, sm: 1 } }}
          >
            <CheckIcon
              sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}
              color="success"
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancel}
            disabled={isLoading}
            sx={{ padding: { xs: 0.6, sm: 1 } }}
          >
            <ClearIcon
              sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}
              color="error"
            />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        gap: 1,
        mb: 1,
      }}
    >
      <IconButton
        onClick={handleWishlistClick}
        disabled={isLoading}
        color={isInWishlist ? 'error' : 'default'}
        sx={{
          backgroundColor: 'background.paper',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            backgroundColor: 'background.paper',
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Box>
  );
};

export default WishlistManager;
