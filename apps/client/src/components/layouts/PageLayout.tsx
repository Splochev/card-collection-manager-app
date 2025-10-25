import Paper from '@mui/material/Paper';
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PAGES, BREAKPOINTS } from '../../constants';
import BottomNavigation from '../organisms/layout/BottomNavigation';
import TopNavigation from '../organisms/layout/TopNavigation';
import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Button, Typography } from '@mui/material';
import AppLoadingScreen from '../organisms/shared/AppLoadingScreen';

const Collection = lazy(() => import('../pages/Collection'));
const Cards = lazy(() => import('../pages/Cards'));
const Wishlist = lazy(() => import('../pages/Wishlist'));

const VITE_REACT_LOCAL_BACKEND_URL = import.meta.env
  .VITE_REACT_LOCAL_BACKEND_URL;
if (!VITE_REACT_LOCAL_BACKEND_URL)
  throw new Error('VITE_REACT_LOCAL_BACKEND_URL is not defined');

export default function PageLayout() {
  const isSmDown = useMediaQuery(BREAKPOINTS.SMALL_DOWN);
  const navigate = useNavigate();
  const location = useLocation();
  const socketIdRef = useRef<string>('');

  const [value, setValue] = useState(
    PAGES.find((page) => location.pathname.includes(page.route))?.index || 0
  );

  useEffect(() => {
    const pageIndex = PAGES.find((page) =>
      location.pathname.includes(page.route)
    )?.index;
    if (pageIndex !== undefined && pageIndex !== value) {
      setValue(pageIndex);
    }
  }, [location.pathname, value]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const page = PAGES[newValue];
    if (page) {
      setValue(newValue);
      navigate(page.route);
    }
  };

  const isValidRoute = PAGES.some((page) =>
    location.pathname.includes(page.route)
  );

  useEffect(() => {
    const socket: Socket = io(`${VITE_REACT_LOCAL_BACKEND_URL}/card-manager`);

    socket.on('connect', () => {
      socketIdRef.current = socket.id ?? '';
    });

    socket.on(
      'searchCardSetFinished',
      async (payload: { collectionName: string; cardSetCode: string }) => {
        toast.success(
          <Grid
            sx={{ display: 'flex', gap: 1, alignItems: 'start', marginTop: 1 }}
          >
            <Typography variant="body2">
              Finished search for "{payload.collectionName}".
            </Typography>
            <Button
              variant="text"
              href={`/cards/${payload.cardSetCode}`}
              sx={{ width: 80 }}
            >
              View
            </Button>
          </Grid>,
          { autoClose: 8000 }
        );
      }
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <Paper
      sx={{
        height: '100vh',
        width: '100%',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <TopNavigation
        isSmDown={isSmDown}
        value={value}
        handleChange={handleChange}
      />
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'top',
          gap: { xs: 0, sm: 2 },
          height: `calc(100vh - ${isSmDown ? '120px' : '60px'})`,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {!isValidRoute && <Navigate to="/cards" replace />}
        <Routes>
          <Route
            path="/cards/:cardNumber?"
            element={
              <Suspense
                fallback={<AppLoadingScreen label="Loading cards..." />}
              >
                <Cards socketId={socketIdRef.current} />
              </Suspense>
            }
          />
          <Route
            path="/collection"
            element={
              <Suspense
                fallback={<AppLoadingScreen label="Loading collection..." />}
              >
                <Collection />
              </Suspense>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Suspense
                fallback={<AppLoadingScreen label="Loading wishlist..." />}
              >
                <Wishlist />
              </Suspense>
            }
          />
        </Routes>
      </Grid>
      {isSmDown && (
        <BottomNavigation value={value} handleChange={handleChange} />
      )}
    </Paper>
  );
}
