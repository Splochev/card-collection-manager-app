import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogto } from '@logto/react';
import type { RootState } from '../stores/store';
import { setUser, setSessionReady, clearUser } from '../stores/userSlice';
import {
  LOGTO_REDIRECT_URI,
  LOGTO_POST_LOGOUT_REDIRECT_URI,
  LOGTO_RESOURCE,
} from '../constants';
import { useSDK } from '../contexts/SDKContext';

/**
 * How often the auth cookie is re-issued. Must be shorter than the cookie
 * maxAge set by the backend (15 minutes) so the session never lapses.
 */
export const SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export interface UseAuthOptions {
  /**
   * The redirect URI for login.
   * @default LOGTO_REDIRECT_URI from constants
   */
  redirectUri?: string;
  /**
   * The redirect URI after logout.
   * @default LOGTO_POST_LOGOUT_REDIRECT_URI from constants
   */
  postLogoutRedirectUri?: string;
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
}

export interface UseAuthResult {
  /**
   * Whether the auth state is loading.
   */
  isLoading: boolean;
  /**
   * Whether the user is authenticated with Logto.
   */
  isAuthenticated: boolean;
  /**
   * Whether the backend auth cookie has been set and API calls can be made.
   */
  isSessionReady: boolean;
  /**
   * Triggers the sign-in flow.
   */
  signIn: () => void;
  /**
   * Clears the backend session and triggers the Logto sign-out flow.
   */
  signOut: () => Promise<void>;
}

/**
 * Hook to manage authentication state and flows.
 * Extracts authentication logic from App.tsx for better testability.
 *
 * The access token is never stored client-side: it is handed to the backend,
 * which keeps it in an httpOnly cookie, and re-sent periodically to refresh it.
 *
 * Must be used within an SDKProvider.
 *
 * @example
 * const { isLoading, isAuthenticated, isSessionReady } = useAuth();
 *
 * if (isLoading || !isSessionReady) return <Loading />;
 *
 * @example
 * // Testing with custom options
 * const { isAuthenticated } = useAuth({
 *   enabled: false,
 * });
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const {
    redirectUri = LOGTO_REDIRECT_URI,
    postLogoutRedirectUri = LOGTO_POST_LOGOUT_REDIRECT_URI,
    resource = LOGTO_RESOURCE,
    enabled = true,
  } = options;

  const dispatch = useDispatch();
  const isSessionReady = useSelector(
    (state: RootState) => state.user.isSessionReady,
  );
  const sdk = useSDK();
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

  // Fetch user info once authenticated
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    fetchUserInfo()
      .then((user) => dispatch(setUser(user)))
      .catch((err) => console.error('Failed to fetch user info', err));
  }, [enabled, isAuthenticated, fetchUserInfo, dispatch]);

  // Hand the access token to the backend (httpOnly cookie) and keep it fresh.
  // getAccessToken transparently refreshes the token when it is near expiry.
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    let cancelled = false;

    const syncSession = async () => {
      try {
        const token = await getAccessToken(resource);
        if (!token) throw new Error('No access token returned');
        await sdk.startSession(token);
        if (!cancelled) dispatch(setSessionReady(true));
      } catch (err) {
        console.error('Failed to set session cookie', err);
      }
    };

    void syncSession();
    const intervalId = setInterval(() => void syncSession(), SESSION_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [enabled, isAuthenticated, getAccessToken, resource, sdk, dispatch]);

  const signIn = useCallback(() => {
    logtoSignIn(redirectUri);
  }, [logtoSignIn, redirectUri]);

  const signOut = useCallback(async () => {
    try {
      await sdk.endSession();
    } catch (err) {
      console.error('Failed to clear session cookie', err);
    }
    dispatch(clearUser());
    await logtoSignOut(postLogoutRedirectUri);
  }, [sdk, dispatch, logtoSignOut, postLogoutRedirectUri]);

  return {
    isLoading,
    isAuthenticated,
    isSessionReady,
    signIn,
    signOut,
  };
}

export default useAuth;
