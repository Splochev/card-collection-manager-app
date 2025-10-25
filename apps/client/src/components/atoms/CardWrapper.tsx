import { Box } from '@mui/material';
import { useState } from 'react';
import WishlistManager from '../organisms/cards/WishlistManager';
import type { ICard } from '../../interfaces/card.interface';

interface CardWrapperProps {
  url?: string;
  name?: string;
  width?: string;
  card?: ICard | null;
  onAddToWishlist?: (quantity: number) => Promise<void>;
  onRemoveFromWishlist?: () => Promise<void>;
}

const CardWrapper = ({
  url,
  name,
  width = '25rem',
  card,
  onAddToWishlist,
  onRemoveFromWishlist,
}: CardWrapperProps) => {
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <img
        src={url}
        alt={name}
        style={{
          width: '100%',
          maxWidth: width,
          height: 'auto',
          borderRadius: 12,
        }}
      />
      {card && onAddToWishlist && onRemoveFromWishlist && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <WishlistManager
            card={card}
            onAddToWishlist={onAddToWishlist}
            onRemoveFromWishlist={onRemoveFromWishlist}
            variant="full"
            isOpen={isWishlistOpen}
            onToggle={() => setIsWishlistOpen(!isWishlistOpen)}
          />
        </Box>
      )}
    </Box>
  );
};

export default CardWrapper;
