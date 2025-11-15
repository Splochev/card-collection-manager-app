import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Logo from '../../icons/Logo';
import Grid from '@mui/material/Grid';
import CoreInput from '../../molecules/CoreInput';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash/debounce';
import { getTabProps } from '../../../utils';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserMenu from './UserMenu';
import { PAGES } from '../../layouts/PageLayout';

const TopNavigation = ({
  value,
  handleChange,
  isSmDown,
}: {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  isSmDown: boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = React.useState('');
  const isVeryNarrow = useMediaQuery('(max-width:500px)');

  // Sync search input with URL
  React.useEffect(() => {
    if (location.pathname.includes(PAGES[0].path)) {
      // For Cards page, read from URL path params
      const cardSetCode = location.pathname.split('/cards/')[1];
      const upperCaseCardSetCode = cardSetCode ? cardSetCode.toUpperCase() : '';
      setSearchValue(upperCaseCardSetCode);
    } else if (location.pathname.includes(PAGES[1].path)) {
      // For Collection page, read from query params
      const filter = searchParams.get('filter') || '';
      setSearchValue(filter.toUpperCase());
    } else {
      // For other pages, clear search
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  const handleSearch = React.useCallback(
    (value: string) => {
      const upperValue = value.toUpperCase();

      if (location.pathname.includes(PAGES[0].path)) {
        // For Cards page, update URL path
        const newPath = upperValue ? `/cards/${upperValue}` : '/cards';
        navigate(newPath);
      } else if (location.pathname.includes(PAGES[1].path)) {
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
    [location.pathname, navigate, searchParams],
  );

  const debouncedHandleSearch = React.useMemo(
    () => debounce(handleSearch, 400),
    [handleSearch],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    setSearchValue(upperValue);
    debouncedHandleSearch(upperValue);
  };

  const label =
    PAGES.find((page) => location.pathname.includes(page.path))?.searchLabel ||
    'Search';

  return (
    <Paper
      sx={{
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingX: 1,
        height: 60,
      }}
      elevation={3}
    >
      {!isSmDown ? (
        <>
          <Grid container spacing={2} alignItems="center">
            <Logo />
            <Tabs value={value} onChange={handleChange} aria-label="navigation">
              {PAGES.map((page, index) => (
                <Tab
                  key={`desktop-${index}-${page.label}`}
                  label={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {page.icon && <page.icon size="small" />}
                      {page.label}
                    </div>
                  }
                  component="a"
                  href={page.path}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  {...getTabProps(index)}
                />
              ))}
            </Tabs>
          </Grid>
          <CoreInput
            label={label}
            value={searchValue}
            onChange={handleInputChange}
            startIcon={<SearchIcon />}
            responsive
          />
          <UserMenu />
        </>
      ) : (
        <Grid
          container
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            flexWrap: 'nowrap',
            paddingX: isVeryNarrow ? 1 : 3,
            gap: isVeryNarrow ? 0.5 : 1.5,
          }}
        >
          <Box sx={{ minWidth: isVeryNarrow ? 28 : 35 }}>
            <Logo />
          </Box>
          <CoreInput
            label={label}
            value={searchValue}
            onChange={handleInputChange}
            startIcon={<SearchIcon />}
          />
          <UserMenu />
        </Grid>
      )}
    </Paper>
  );
};

export default TopNavigation;
