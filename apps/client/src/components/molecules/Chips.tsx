import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRef, useState, useEffect } from 'react';

const SCROLL_STEP = 5;
const SCROLL_TICK = 8;

const STYLES = {
  container: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
  },
  chipContainer: {
    display: 'flex',
    gap: 1,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
};

interface Props {
  labels: string[];
  width?: string;
}

const Chips = ({ labels, width = '35rem' }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollIntervalRef = useRef<number | null>(null);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current !== null) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const startScrolling = (direction: number) => {
    stopScrolling();
    scrollIntervalRef.current = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: direction * SCROLL_STEP });
      updateScrollButtons();
    }, SCROLL_TICK) as unknown as number;
  };

  const onPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    position: number,
  ) => {
    e.preventDefault();
    startScrolling(position);
    try {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    stopScrolling();
    try {
      (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
      stopScrolling();
    };
  }, [labels.length]);

  const buttonProps = (position: 'l' | 'r') => ({
    disabled: position === 'l' ? !canScrollLeft : !canScrollRight,
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) =>
      onPointerDown(e, position === 'l' ? -1 : 1),
    onPointerUp: onPointerUp,
    onPointerCancel: stopScrolling,
    onPointerLeave: stopScrolling,
    'aria-label': position === 'l' ? 'Scroll left' : 'Scroll right',
  });

  const showButtons = canScrollLeft || canScrollRight;
  return (
    <Grid sx={{ ...STYLES.container, maxWidth: width }}>
      {showButtons && (
        <IconButton {...buttonProps('l')}>
          <ChevronLeftIcon />
        </IconButton>
      )}
      <Grid ref={scrollRef} sx={STYLES.chipContainer}>
        {labels.map((label, index) => (
          <Chip key={`${label}-${index}`} label={label} />
        ))}
      </Grid>
      {showButtons && (
        <IconButton {...buttonProps('r')}>
          <ChevronRightIcon />
        </IconButton>
      )}
    </Grid>
  );
};

export default Chips;
