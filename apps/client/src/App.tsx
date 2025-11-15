import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from './stores/store';
import { setUser, setAccessToken } from './stores/userSlice';
import { lightTheme, darkTheme } from './themes';
import PageLayout from './components/layouts/PageLayout';
import ScrollbarStyles from './components/atoms/ScrollbarStyles';
import ConfirmDialog from './components/organisms/layout/ConfirmDialog';
import AppLoadingScreen from './components/organisms/shared/AppLoadingScreen';
import {
  LogtoProvider,
  type LogtoConfig,
  useLogto,
  useHandleSignInCallback,
} from '@logto/react';
import Grid from '@mui/material/Grid';
import { LOGTO_APP_ID, LOGTO_ENDPOINT, LOGTO_REDIRECT_URI, LOGTO_RESOURCE } from './constants';

const config: LogtoConfig = {
  endpoint: LOGTO_ENDPOINT,
  appId: LOGTO_APP_ID,
  resources: [LOGTO_RESOURCE],
};

function App() {
  return (
    <LogtoProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </BrowserRouter>
    </LogtoProvider>
  );
}

function CallbackPage() {
  const { isLoading } = useHandleSignInCallback(() => {
    window.location.replace('/');
  });

  if (isLoading) {
    return (
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'top',
          gap: 2,
          height: `100vh`,
          overflowY: 'auto',
        }}
      >
        <AppLoadingScreen label="Redirecting..." />
      </Grid>
    );
  }
  return null;
}

function ProtectedApp() {
  const theme = useSelector((state: RootState) =>
    state.theme.mode === 'light' ? lightTheme : darkTheme
  );
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const dispatch = useDispatch();
  const { signIn, isAuthenticated, isLoading, fetchUserInfo, getAccessToken } =
    useLogto();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn(LOGTO_REDIRECT_URI);
    }
  }, [isLoading, isAuthenticated, signIn]);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        try {
          const user = await fetchUserInfo();
          dispatch(setUser(user));

          const token = await getAccessToken(LOGTO_RESOURCE);
          dispatch(setAccessToken(token));
        } catch (err) {
          console.error('Failed to fetch user or token', err);
        }
      })();
    }
  }, [isAuthenticated, fetchUserInfo, getAccessToken, dispatch]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', JSON.stringify(accessToken));
    }
  }, [accessToken]);

  if (isLoading || !isAuthenticated) {
    return (
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'top',
          gap: 2,
          height: `100vh`,
          overflowY: 'auto',
        }}
      >
        <AppLoadingScreen
          label={!isAuthenticated ? 'Redirecting to login...' : 'Loading...'}
        />
      </Grid>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <ScrollbarStyles />
      <PageLayout />
      <ConfirmDialog />
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
