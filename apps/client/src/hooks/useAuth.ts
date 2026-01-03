import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogto } from '@logto/react';
import type { RootState } from '../stores/store';
import { setUser, setAccessToken } from '../stores/userSlice';
import { LOGTO_REDIRECT_URI, LOGTO_RESOURCE } from '../constants';

export interface UseAuthOptions {
  /**
   * The redirect URI for login.
   * @default LOGTO_REDIRECT_URI from constants
   */
  redirectUri?: string;
  /**
   * The resource for access token.
   * @default LOGTO_RESOURCE from constants
   */
  resource?: string;
  /**
   * Whether authentication is enabled.
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom storage for access token persistence.
   * @default localStorage
   */
  storage?: {
    setItem: (key: string, value: string) => void;
  };
}

export interface UseAuthResult {
  /**
   * Whether the auth state is loading.
   */
  isLoading: boolean;
  /**
   * Whether the user is authenticated.
   */
  isAuthenticated: boolean;
  /**
   * The current access token, if available.
   */
  accessToken: string | null;
  /**
   * Triggers the sign-in flow.
   */
  signIn: () => void;
  /**
   * Triggers the sign-out flow.
   */
  signOut: () => void;
}

/**
 * Hook to manage authentication state and flows.
 * Extracts authentication logic from App.tsx for better testability.
 *
 * @example
 * const { isLoading, isAuthenticated, signIn } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <LoginRedirect />;
 *
 * @example
 * // Testing with custom options
 * const { isAuthenticated } = useAuth({
 *   enabled: false,
 *   storage: mockStorage,
 * });
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const {
    redirectUri = LOGTO_REDIRECT_URI,
    resource = LOGTO_RESOURCE,
    enabled = true,
    storage = localStorage,
  } = options;

  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const {
    signIn: logtoSignIn,
    signOut: logtoSignOut,
    isAuthenticated,
    isLoading,
    fetchUserInfo,
    getAccessToken,
  } = useLogto();

  // Auto-redirect to login if not authenticated
  useEffect(() => {
    if (enabled && !isLoading && !isAuthenticated) {
      logtoSignIn(redirectUri);
    }
  }, [enabled, isLoading, isAuthenticated, logtoSignIn, redirectUri]);

  // Fetch user info and access token after authentication
  useEffect(() => {
    if (!enabled) return;

    if (isAuthenticated) {
      (async () => {
        try {
          const user = await fetchUserInfo();
          dispatch(setUser(user));

          const token = await getAccessToken(resource);
          dispatch(setAccessToken(token ?? null));
        } catch (err) {
          console.error('Failed to fetch user or token', err);
        }
      })();
    }
  }, [
    enabled,
    isAuthenticated,
    fetchUserInfo,
    getAccessToken,
    dispatch,
    resource,
  ]);

  // Persist access token to storage
  useEffect(() => {
    if (accessToken) {
      storage.setItem('accessToken', JSON.stringify(accessToken));
    }
  }, [accessToken, storage]);

  const signIn = useCallback(() => {
    logtoSignIn(redirectUri);
  }, [logtoSignIn, redirectUri]);

  const signOut = useCallback(() => {
    logtoSignOut();
  }, [logtoSignOut]);

  return {
    isLoading,
    isAuthenticated,
    accessToken,
    signIn,
    signOut,
  };
}

export default useAuth;
