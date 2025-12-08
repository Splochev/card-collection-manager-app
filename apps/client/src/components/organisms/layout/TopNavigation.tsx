import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Logo from '../../icons/Logo';
import Grid from '@mui/material/Grid';
import CoreInput from '../../molecules/CoreInput';
import SearchIcon from '@mui/icons-material/Search';
import { getTabProps } from '../../../utils';
import { Box } from '@mui/material';
import UserMenu from './UserMenu';
import { PAGES } from '../../layouts/PageLayout';
import { useNavigationSearch } from '../../../hooks/useNavigationSearch';

const STYLES = {
  topNavigation: {
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingX: 1,
    height: 60,
  },
  tabLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  mobileTopNavigation: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingRight: 3,
    gap: 1.5,
    '@media (max-width:500px)': {
      paddingX: 1,
      gap: 0.5,
    },
  },
  mobileLogo: {
    minWidth: 35,
  },
};

const TopNavigation = ({
  value,
  handleChange,
  isSmDown,
}: {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
  isSmDown: boolean;
}) => {
  const { searchValue, handleInputChange, label } = useNavigationSearch({
    pages: PAGES,
  });

  return (
    <Paper sx={STYLES.topNavigation} elevation={3}>
      {!isSmDown ? (
        <>
          <Grid container spacing={2} alignItems="center">
            <Logo />
            <Tabs value={value} onChange={handleChange} aria-label="navigation">
              {PAGES.map((page, index) => (
                <Tab
                  key={`desktop-${index}-${page.label}`}
                  label={
                    <div style={STYLES.tabLabel}>
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
        <Grid container sx={STYLES.mobileTopNavigation}>
          <Box sx={STYLES.mobileLogo}>
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
