import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { ICard } from '@card-collection-manager-app/shared';
import CoreNumber from '../../molecules/CoreNumber';

const STYLES = {
  iconButton0: {
    '&:hover': {
      transform: 'scale(1.1)',
      transition: 'transform 0.2s ease-in-out',
    },
  },
  box0: {
    padding: { xs: 0.9, sm: 1.5 },
    borderRadius: 2,
    backgroundColor: 'background.paper',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
  },
  box1: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 1,
    mb: 1,
  },
  iconButton1: {
    backgroundColor: 'background.paper',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
    '&:hover': {
      backgroundColor: 'background.paper',
      transform: 'scale(1.1)',
      transition: 'transform 0.2s ease-in-out',
    },
  },
};

interface WishlistManagerProps {
  card: ICard | null;
  onAddToWishlist: (quantity: number) => Promise<void>;
  onRemoveFromWishlist: () => Promise<void>;
  variant?: 'full' | 'icon-only';
  isOpen?: boolean;
  onToggle?: () => void;
}

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

  const isInWishlist = card?.wishlistCount && card.wishlistCount > 0;

  const handleWishlistClick = () => {
    if (isInWishlist) {
      handleRemove();
    } else {
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

  switch (true) {
    case !card:
      return null;
    case variant === 'icon-only' && !isOpen:
      return (
        <IconButton
          onClick={handleWishlistClick}
          disabled={isLoading}
          color={isInWishlist ? 'error' : 'default'}
          size="small"
          sx={STYLES.iconButton0}
        >
          {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      );
    case isOpen:
      return (
        <Box sx={STYLES.box0}>
          <CoreNumber
            min={0}
            max={100}
            value={wishlistQuantity}
            setValue={(value: number | '') =>
              setWishlistQuantity(Number(value))
            }
            label={
              isInWishlist
                ? `Wishlisted: ${card.wishlistCount}`
                : 'Wishlist card'
            }
            onSubmit={handleAddWithQuantity}
            onCancel={handleCancel}
            isLoading={isLoading}
            variant="externalWithControls"
            inputWidth={70}
          />
        </Box>
      );
    default:
      return (
        <Box sx={STYLES.box1}>
          <IconButton
            onClick={handleWishlistClick}
            disabled={isLoading}
            color={isInWishlist ? 'error' : 'default'}
            sx={STYLES.iconButton1}
          >
            {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
      );
  }
};

export default WishlistManager;
