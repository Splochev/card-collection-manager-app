import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRef, useState, useEffect } from 'react';

const Chips = ({
  labels,
  width = '35rem',
}: {
  labels: string[];
  width?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scrollIntervalRef = useRef<number | null>(null);
  const SCROLL_STEP = 5;
  const SCROLL_TICK = 8;

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

  const showButtons = canScrollLeft || canScrollRight;
  return (
    <Grid
      sx={{
        display: 'flex',
        gap: 1,
        maxWidth: width,
        alignItems: 'center',
      }}
    >
      {showButtons && (
        <IconButton
          disabled={!canScrollLeft}
          onPointerDown={(e) => {
            e.preventDefault();
            startScrolling(-1);
            try {
              (e.currentTarget as any).setPointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerUp={(e) => {
            stopScrolling();
            try {
              (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerCancel={() => stopScrolling()}
          onPointerLeave={() => stopScrolling()}
          aria-label="Scroll left"
        >
          <ChevronLeftIcon />
        </IconButton>
      )}
      <Grid
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {labels.map((label, index) => (
          <Chip key={`${label}-${index}`} label={label} />
        ))}
      </Grid>
      {showButtons && (
        <IconButton
          disabled={!canScrollRight}
          onPointerDown={(e) => {
            e.preventDefault();
            startScrolling(1);
            try {
              (e.currentTarget as any).setPointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerUp={(e) => {
            stopScrolling();
            try {
              (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerCancel={() => stopScrolling()}
          onPointerLeave={() => stopScrolling()}
          aria-label="Scroll right"
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </Grid>
  );
};

export default Chips;
