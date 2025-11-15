import { Box } from '@mui/material';
import { useState } from 'react';
import WishlistManager from '../organisms/cards/WishlistManager';
import type { ICard } from '../../interfaces/card.interface';

const STYLES = {
  cardWrapper: { position: 'relative', width: '100%', overflow: 'hidden' },
  image: { width: '100%', height: 'auto', borderRadius: 12 },
  box: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
};

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
    <Box sx={STYLES.cardWrapper}>
      <img src={url} alt={name} style={{ ...STYLES.image, maxWidth: width }} />
      {card && onAddToWishlist && onRemoveFromWishlist && (
        <Box sx={STYLES.box}>
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
