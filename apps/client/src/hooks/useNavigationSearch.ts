import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';

export interface PageConfig {
  path: string;
  searchLabel: string;
}

export interface UseNavigationSearchOptions {
  /**
   * Array of page configurations.
   */
  pages: readonly PageConfig[];
  /**
   * Debounce delay in milliseconds.
   * @default 400
   */
  debounceMs?: number;
  /**
   * Index of the cards page (uses path params).
   * @default 0
   */
  cardsPageIndex?: number;
  /**
   * Index of the collection page (uses query params).
   * @default 1
   */
  collectionPageIndex?: number;
}

export interface UseNavigationSearchResult {
  /**
   * Current search input value.
   */
  searchValue: string;
  /**
   * Handler for search input changes.
   */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * The search label for the current page.
   */
  label: string;
  /**
   * Performs an immediate search (bypasses debounce).
   */
  searchImmediate: (value: string) => void;
}

/**
 * Hook to manage search input with URL synchronization.
 * Extracts search logic from TopNavigation for better testability.
 *
 * @example
 * const { searchValue, handleInputChange, label } = useNavigationSearch({
 *   pages: PAGES,
 * });
 */
export function useNavigationSearch(
  options: UseNavigationSearchOptions
): UseNavigationSearchResult {
  const {
    pages,
    debounceMs = 400,
    cardsPageIndex = 0,
    collectionPageIndex = 1,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  const cardsPage = pages[cardsPageIndex];
  const collectionPage = pages[collectionPageIndex];

  // Sync search input with URL
  useEffect(() => {
    if (cardsPage && location.pathname.includes(cardsPage.path)) {
      // For Cards page, read from URL path params
      const cardSetCode = location.pathname.split(`${cardsPage.path}/`)[1];
      const upperCaseCardSetCode = cardSetCode ? cardSetCode.toUpperCase() : '';
      setSearchValue(upperCaseCardSetCode);
    } else if (
      collectionPage &&
      location.pathname.includes(collectionPage.path)
    ) {
      // For Collection page, read from query params
      const filter = searchParams.get('filter') || '';
      setSearchValue(filter.toUpperCase());
    } else {
      // For other pages, clear search
      setSearchValue('');
    }
  }, [location.pathname, searchParams, cardsPage, collectionPage]);

  const handleSearch = useCallback(
    (value: string) => {
      const upperValue = value.toUpperCase();

      if (cardsPage && location.pathname.includes(cardsPage.path)) {
        // For Cards page, update URL path
        const newPath = upperValue
          ? `${cardsPage.path}/${upperValue}`
          : cardsPage.path;
        navigate(newPath);
      } else if (
        collectionPage &&
        location.pathname.includes(collectionPage.path)
      ) {
        // For Collection page, update query params
        const newParams = new URLSearchParams(searchParams);
        if (upperValue) {
          newParams.set('filter', upperValue);
        } else {
          newParams.delete('filter');
        }
        navigate(`${location.pathname}?${newParams.toString()}`, {
          replace: true,
        });
      }
    },
    [location.pathname, navigate, searchParams, cardsPage, collectionPage]
  );

  const debouncedHandleSearch = useMemo(
    () => debounce(handleSearch, debounceMs),
    [handleSearch, debounceMs]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [debouncedHandleSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const upperValue = e.target.value.toUpperCase();
      setSearchValue(upperValue);
      debouncedHandleSearch(upperValue);
    },
    [debouncedHandleSearch]
  );

  const label = useMemo(() => {
    return (
      pages.find((page) => location.pathname.includes(page.path))
        ?.searchLabel || 'Search'
    );
  }, [pages, location.pathname]);

  return {
    searchValue,
    handleInputChange,
    label,
    searchImmediate: handleSearch,
  };
}

export default useNavigationSearch;
