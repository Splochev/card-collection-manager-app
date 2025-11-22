import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { getTabProps } from '../../../utils';
import * as React from 'react';
import { PAGES } from '../../layouts/PageLayout';

const STYLES = {
  bottomNavWrapper: {
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingX: 1,
  },
  tabs: {
    width: '100%',
    '& .MuiTabs-list': {
      justifyContent: 'space-around',
    },
    '& .MuiTab-root': {
      display: 'flex',
      alignItems: 'center',
      gap: 4.5,
      fontSize: '0.875rem',
      minWidth: '90px',
      '@media (max-width:415px)': {
        fontSize: '0.7rem',
        minWidth: '60px',
      },
    },
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 4.5,
  },
};

const BottomNavigation = ({
  value,
  handleChange,
}: {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
}) => {
  return (
    <Paper sx={STYLES.bottomNavWrapper} elevation={3}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="navigation"
        sx={STYLES.tabs}
      >
        {PAGES.map((page, index) => (
          <Tab
            key={`mobile-${index}-${page.label}`}
            label={
              <div style={STYLES.tab}>
                {page.icon && <page.icon size="medium" />}
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
    </Paper>
  );
};

export default BottomNavigation;
