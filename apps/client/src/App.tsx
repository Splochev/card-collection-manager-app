import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { type RootState } from './stores/store';
import { lightTheme, darkTheme } from './themes';
import PageLayout from './components/layouts/PageLayout';
import ScrollbarStyles from './components/atoms/ScrollbarStyles';
import ConfirmDialog from './components/organisms/layout/ConfirmDialog';
import AppLoadingScreen from './components/organisms/shared/AppLoadingScreen';
import { SDKProvider } from './contexts/SDKContext';
import {
  LogtoProvider,
  type LogtoConfig,
  useHandleSignInCallback,
} from '@logto/react';
import Grid from '@mui/material/Grid';
import {
  LOGTO_APP_ID,
  LOGTO_ENDPOINT,
  LOGTO_RESOURCE,
} from './constants';
import { useAuth } from './hooks/useAuth';

const pageLayout = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'top',
  gap: 2,
  height: `100vh`,
  overflowY: 'auto',
};

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
      <Grid sx={pageLayout}>
        <AppLoadingScreen label="Redirecting..." />
      </Grid>
    );
  }
  return null;
}

function ProtectedApp() {
  const theme = useSelector((state: RootState) =>
    state.theme.mode === 'light' ? lightTheme : darkTheme,
  );
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Grid sx={pageLayout}>
        <AppLoadingScreen
          label={!isAuthenticated ? 'Redirecting to login...' : 'Loading...'}
        />
      </Grid>
    );
  }

  return (
    <SDKProvider>
      <ThemeProvider theme={theme}>
        <ScrollbarStyles />
        <PageLayout />
        <ConfirmDialog />
        <ToastContainer />
      </ThemeProvider>
    </SDKProvider>
  );
}

export default App;
