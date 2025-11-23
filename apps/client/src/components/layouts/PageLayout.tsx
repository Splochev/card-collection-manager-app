import Paper from '@mui/material/Paper';
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import CardSearchIcon from '../icons/CardSearchIcon';
import CollectionIcon from '../icons/CollectionIcon';
import FavoriteIcon from '../icons/FavoriteIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BREAKPOINTS, BACKEND_URL } from '../../constants';
import BottomNavigation from '../organisms/layout/BottomNavigation';
import TopNavigation from '../organisms/layout/TopNavigation';
import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import AppLoadingScreen from '../organisms/shared/AppLoadingScreen';
import SearchCardSetFinished from '../toasts/SearchCardSetFinished';

type PageConfig = {
  label: string;
  path: string;
  param?: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  searchLabel: string;
  icon: React.ComponentType<any>;
};

export const PAGES: readonly PageConfig[] = [
  {
    label: 'cards',
    path: '/cards',
    param: 'cardNumber',
    component: lazy(() => import('../pages/Cards')),
    searchLabel: 'Find cards by set number',
    icon: CardSearchIcon,
  },
  {
    label: 'collection',
    path: '/collection',
    component: lazy(() => import('../pages/Collection')),
    searchLabel:
      'Find cards in collection by card name, set number or set name',
    icon: CollectionIcon,
  },
  {
    label: 'Wishlist',
    path: '/wishlist',
    component: lazy(() => import('../pages/Wishlist')),
    searchLabel: 'Find cards in wishlist by card name, set number or set name',
    icon: FavoriteIcon,
  },
] as const;

const STYLES = {
  paper: {
    height: '100vh',
    width: '100%',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'top',
    gap: { xs: 0, sm: 2 },
    overflowY: 'auto',
    overflowX: 'hidden',
    height: `calc(100vh - 60px)`,
    '@media (max-width: 970px)': {
      height: `calc(100vh - 120px)`,
    },
  },
};

export default function PageLayout() {
  const isSmDown = useMediaQuery(BREAKPOINTS.SMALL_DOWN);
  const navigate = useNavigate();
  const location = useLocation();
  const socketIdRef = useRef<string>('');

  const [value, setValue] = useState(() => {
    const idx = PAGES.findIndex((page) =>
      location.pathname.includes(page.path),
    );
    return idx === -1 ? 0 : idx;
  });

  useEffect(() => {
    const pIndex = PAGES.findIndex((p) => location.pathname.includes(p.path));
    if (pIndex !== value) setValue(pIndex === -1 ? 0 : pIndex);
  }, [location.pathname, value]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const page = PAGES[newValue];
    if (page) {
      setValue(newValue);
      navigate(page.path);
    }
  };

  useEffect(() => {
    const socket: Socket = io(`${BACKEND_URL}/card-manager`);

    socket.on('connect', () => {
      socketIdRef.current = socket.id ?? '';
    });

    socket.on(
      'searchCardSetFinished',
      async (payload: { collectionName: string; cardSetCode: string }) => {
        toast.success(
          <SearchCardSetFinished
            collectionName={payload.collectionName}
            cardSetCode={payload.cardSetCode}
          />,
          { autoClose: 8000 },
        );
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <Paper sx={STYLES.paper}>
      <TopNavigation
        isSmDown={isSmDown}
        value={value}
        handleChange={handleChange}
      />
      <Grid sx={STYLES.grid}>
        {!PAGES.some((page) => location.pathname.includes(page.path)) && (
          <Navigate to="/cards" replace />
        )}
        <Routes>
          {PAGES.map((route) => {
            return (
              <Route
                key={route.label}
                path={`${route.path}${route.param ? `/:${route.param}?` : ''}`}
                element={
                  <Suspense
                    fallback={
                      <AppLoadingScreen label={`Loading ${route.label}...`} />
                    }
                  >
                    <route.component socketId={socketIdRef.current} />
                  </Suspense>
                }
              />
            );
          })}
        </Routes>
      </Grid>
      {isSmDown && (
        <BottomNavigation value={value} handleChange={handleChange} />
      )}
    </Paper>
  );
}
