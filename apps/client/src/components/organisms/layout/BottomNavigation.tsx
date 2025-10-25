import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PAGES } from '../../../constants';
import { getTabProps } from '../../../utils';
import * as React from 'react';

const BottomNavigation = ({
  value,
  handleChange,
}: {
  value: number;
  handleChange: (event: React.SyntheticEvent, newValue: number) => void;
}) => {
  const isNarrow = useMediaQuery('(max-width:415px)');

  return (
    <Paper
      sx={{
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingX: 1,
      }}
      elevation={3}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="navigation"
        sx={{
          width: '100%',
          '& .MuiTabs-list': {
            justifyContent: 'space-around',
          },
          '& .MuiTab-root': {
            fontSize: isNarrow ? '0.7rem' : '0.875rem',
            minWidth: isNarrow ? '60px' : '90px',
          },
        }}
      >
        {PAGES.map((page) => (
          <Tab
            key={`mobile-${page.index}-${page.label}`}
            label={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isNarrow ? 3 : 6,
                }}
              >
                {page.icon && (
                  <page.icon size={isNarrow ? 'small' : 'medium'} />
                )}
                {page.label}
              </div>
            }
            component="a"
            href={page.route}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }}
            {...getTabProps(page.index)}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default BottomNavigation;
