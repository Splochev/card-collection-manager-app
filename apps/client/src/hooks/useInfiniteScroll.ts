import { useEffect, useRef, type RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  /**
   * Whether there are more items to load.
   */
  hasMore: boolean;
  /**
   * Whether a load operation is currently in progress.
   */
  isLoading: boolean;
  /**
   * Callback to load more items.
   */
  onLoadMore: () => void;
  /**
   * IntersectionObserver threshold (0-1).
   * @default 0.1
   */
  threshold?: number;
  /**
   * Root margin for IntersectionObserver.
   * @default '0px'
   */
  rootMargin?: string;
}

export interface UseInfiniteScrollResult {
  /**
   * Ref to attach to the sentinel/trigger element.
   */
  observerTarget: RefObject<HTMLDivElement | null>;
}

/**
 * Hook to handle infinite scroll functionality using IntersectionObserver.
 * Extracts the infinite scroll logic for better testability.
 *
 * @example
 * const { observerTarget } = useInfiniteScroll({
 *   hasMore,
 *   isLoading,
 *   onLoadMore: () => fetchMore(),
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} />)}
 *     <div ref={observerTarget} />
 *   </div>
 * );
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '0px',
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return { observerTarget };
}

export default useInfiniteScroll;
