import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useSearchParams } from 'react-router-dom';
import { useCardsManager } from '../../contexts/SDKContext';
import { useConfirm } from '../../hooks/useConfirm';
import type { IWishlistCard } from '@card-collection-manager-app/shared';
import { t } from '../../constants';

const CARD_IMG_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="145"%3E%3Crect width="100%25" height="100%25" fill="%23333"%2F%3E%3C%2Fsvg%3E';

const STYLES = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: { xs: 1.5, sm: 2 },
    py: 1,
    gap: 1,
    flexWrap: 'wrap',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: { xs: 1.5, sm: 2 },
    justifyContent: 'flex-start',
    '@media (max-width: 670px)': { justifyContent: 'center' },
    px: { xs: 1.5, sm: 2 },
    pb: 4,
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    width: 195,
    cursor: 'default',
  },
  img: {
    width: 195,
    height: 'auto',
    objectFit: 'cover',
    borderRadius: 1,
    display: 'block',
    backgroundColor: 'action.hover',
  },
  cardName: {
    fontSize: { xs: '0.65rem', sm: '0.72rem' },
    textAlign: 'center',
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  count: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 1,
    color: 'text.secondary',
  },
};

/** Parses the clipboard wishlist text format into [{name, count}] */
function parseWishlistText(text: string): { name: string; count: number }[] {
  const items: { name: string; count: number }[] = [];
  const lineRegex = /^(\d+)x\s+(.+)$/;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const match = lineRegex.exec(trimmed);
    if (match) {
      items.push({ count: parseInt(match[1], 10), name: match[2].trim() });
    }
  }
  return items;
}

/** Lazy-loading image that only sets src when visible */
function LazyImage({ src, alt }: { src: string | null; alt: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <Box
      component="img"
      ref={imgRef}
      src={CARD_IMG_PLACEHOLDER}
      alt={alt}
      onLoad={() => setLoaded(true)}
      sx={{
        ...STYLES.img,
        opacity: loaded ? 1 : 0.5,
        transition: 'opacity 0.3s',
        width: 195,
        height: 'auto',
      }}
    />
  );
}

const Wishlist = () => {
  const cardsManager = useCardsManager();
  const { confirm } = useConfirm();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || '';

  const [cards, setCards] = useState<IWishlistCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await cardsManager.getWishlist();
      setCards(data);
    } finally {
      setIsLoading(false);
    }
  }, [cardsManager]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const filteredCards = useMemo(() => {
    if (!filter) return cards;
    const lower = filter.toLowerCase();
    return cards.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.desc?.toLowerCase().includes(lower),
    );
  }, [cards, filter]);

  const handleCopyWishlist = useCallback(async () => {
    const text = cards.map((c) => `${c.total_count}x ${c.name}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [cards]);

  const handleImportSave = useCallback(async () => {
    const items = parseWishlistText(importText);
    if (!items.length) return;

    const confirmed = await confirm({
      title: 'Merge Wishlist',
      message: `This will add ${items.length} card(s) to your wishlist. Existing cards will have their counts increased. Continue?`,
      variant: 'warning',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    setIsMerging(true);
    try {
      await cardsManager.mergeWishlist(items);
      setImportOpen(false);
      setImportText('');
      await fetchWishlist();
    } finally {
      setIsMerging(false);
    }
  }, [importText, confirm, cardsManager, fetchWishlist]);

  return (
    <Box sx={STYLES.container}>
      {/* Toolbar */}
      <Box sx={STYLES.toolbar}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography {...t.h6}>Wishlist</Typography>
          {!isLoading && (
            <Chip label={`${filteredCards.length} cards`} size="small" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip
            title={copySuccess ? 'Copied!' : 'Copy wishlist to clipboard'}
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyWishlist}
                disabled={isLoading || cards.length === 0}
                color={copySuccess ? 'success' : 'primary'}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            startIcon={<PlaylistAddIcon />}
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
        </Box>
      </Box>

      {/* Card grid */}
      {isLoading ? (
        <Box sx={STYLES.emptyState}>
          <CircularProgress />
        </Box>
      ) : filteredCards.length === 0 ? (
        <Box sx={STYLES.emptyState}>
          <Typography {...t.p.body1}>
            {filter ? 'No cards match your search.' : 'Your wishlist is empty.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={STYLES.grid}>
          {filteredCards.map((card) => (
            <Box key={card.id} sx={STYLES.card}>
              <LazyImage src={card.imageUrl} alt={card.name} />
              <Typography sx={STYLES.cardName}>
                <span style={{ ...STYLES.count }}>{card.total_count}x</span>{' '}
                {card.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Import dialog */}
      <Dialog
        open={importOpen}
        onClose={() => !isMerging && setImportOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Import Wishlist</DialogTitle>
        <DialogContent>
          <Typography {...t.p.body2} sx={{ mb: 1.5 }}>
            Paste your wishlist below. Format: <code>1x Card Name</code> per
            line. Section headers (e.g. <code>Monster:</code>) are ignored.
          </Typography>
          <TextField
            multiline
            fullWidth
            minRows={8}
            maxRows={20}
            placeholder={
              'Monster:\n1x Dark Magician\n\nSpell:\n1x Pot of Greed'
            }
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            disabled={isMerging}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setImportOpen(false)}
            disabled={isMerging}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportSave}
            disabled={isMerging || !importText.trim()}
            variant="contained"
          >
            {isMerging ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wishlist;
