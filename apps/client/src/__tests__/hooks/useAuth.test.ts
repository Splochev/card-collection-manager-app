import { renderHook, act } from '@testing-library/react';
import { useLogto } from '@logto/react';
import {
  useAuth,
  UseAuthOptions,
  SESSION_REFRESH_INTERVAL_MS,
} from '../../hooks/useAuth';
import { LOGTO_REDIRECT_URI, LOGTO_RESOURCE } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { setSessionReady, setUser, clearUser } from '../../stores/userSlice';
import { useSDK } from '../../contexts/SDKContext';

jest.mock('../../constants', () => ({
  LOGTO_REDIRECT_URI: 'http://localhost:3000/callback',
  LOGTO_RESOURCE: 'http://localhost:8080',
  LOGTO_ENDPOINT: 'http://localhost:3001',
  LOGTO_APP_ID: 'test-app-id',
  LOGTO_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:8080',
}));

jest.mock('@logto/react', () => ({
  useLogto: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../contexts/SDKContext', () => ({
  useSDK: jest.fn(),
}));

describe('useAuth', () => {
  let mockOptions: UseAuthOptions = undefined as unknown as UseAuthOptions;
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();
  const mockFetchUserInfo = jest.fn();
  const mockGetAccessToken = jest.fn();
  const mockDispatch = jest.fn();
  const mockSDK = {
    startSession: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
  };
  const mockUser = {
    name: 'test@test.test',
    username: 'test@test.test',
    email: 'test@test.test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogto as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      isLoading: false,
      fetchUserInfo: mockFetchUserInfo,
      getAccessToken: mockGetAccessToken,
    });

    (mockFetchUserInfo as jest.Mock).mockResolvedValue(mockUser);
    (mockGetAccessToken as jest.Mock).mockResolvedValue('test-token');

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockReturnValue(false);
    (useSDK as jest.Mock).mockReturnValue(mockSDK);

    mockOptions = {
      redirectUri: LOGTO_REDIRECT_URI,
      resource: LOGTO_RESOURCE,
      enabled: true,
    } as UseAuthOptions;
  });

  it('auto-redirects to login if not authenticated', async () => {
    (useLogto as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
      isLoading: false,
      fetchUserInfo: mockFetchUserInfo,
      getAccessToken: mockGetAccessToken,
    });

    await act(() => {
      renderHook(() => useAuth(mockOptions));
    });

    expect(mockSignIn).toHaveBeenCalledWith(LOGTO_REDIRECT_URI);
  });

  it('fetches user info and access token', async () => {
    await act(() => {
      renderHook(() => useAuth(mockOptions));
    });

    expect(mockFetchUserInfo).toHaveBeenCalled();
    expect(mockGetAccessToken).toHaveBeenCalled();
    expect(mockGetAccessToken).toHaveBeenCalledWith(LOGTO_RESOURCE);
    expect(mockDispatch).toHaveBeenCalledWith(setUser(mockUser));
  });

  it('sets httpOnly cookie via SDK and marks the session ready', async () => {
    await act(() => {
      renderHook(() => useAuth(mockOptions));
    });

    expect(mockSDK.startSession).toHaveBeenCalledWith('test-token');
    expect(mockDispatch).toHaveBeenCalledWith(setSessionReady(true));
  });

  it('does not mark the session ready if setting the cookie fails', async () => {
    mockSDK.startSession.mockRejectedValueOnce(new Error('network'));
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await act(() => {
      renderHook(() => useAuth(mockOptions));
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(setSessionReady(true));
    consoleSpy.mockRestore();
  });

  it('refreshes the session cookie periodically', async () => {
    jest.useFakeTimers();
    try {
      await act(() => {
        renderHook(() => useAuth(mockOptions));
      });
      expect(mockSDK.startSession).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(SESSION_REFRESH_INTERVAL_MS);
      });
      expect(mockSDK.startSession).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('provides signIn and signOut functions', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn();
    });

    expect(mockSignIn).toHaveBeenCalledWith(LOGTO_REDIRECT_URI);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSDK.endSession).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(clearUser());
    expect(mockSignOut).toHaveBeenCalledWith('http://localhost:3000');
  });
});

/**
// LESSON 3 — Testing React hooks
//
// React hooks encapsulate logic that can be reused across components.
// Testing hooks ensures that their behavior is correct in isolation.
//
// TOOLS USED
//   • renderHook()  – mounts a hook in a test environment
//   • act()         – ensures state updates are applied synchronously
//   • mock functions – simulate external dependencies (e.g., Redux, APIs)
// ─────────────────────────────────────────────────────────────

import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogto } from '@logto/react';
import { setUser, setAccessToken } from '../../stores/userSlice';
import { useAuth } from '../../hooks/useAuth';
import { LOGTO_REDIRECT_URI, LOGTO_RESOURCE } from '../../constants';

// Mock the constants module to avoid import.meta.env syntax errors in Jest.
// Jest runs in Node.js and cannot parse import.meta — mocking the module
// prevents Jest from ever reading the real constants.ts file.
jest.mock('../../constants', () => ({
  LOGTO_REDIRECT_URI: 'http://localhost:3000/callback',
  LOGTO_RESOURCE: 'http://localhost:8080',
  LOGTO_ENDPOINT: 'http://localhost:3001',
  LOGTO_APP_ID: 'test-app-id',
  LOGTO_POST_LOGOUT_REDIRECT_URI: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:8080',
}));


jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@logto/react', () => ({
  useLogto: jest.fn(),
}));

describe('useAuth', () => {
  // ── Mock functions ──────────────────────────────────────────
  // These stand in for real external dependencies (Redux, Logto).
  // When the hook calls these, we can track what arguments were
  // passed and verify behavior without executing the real code.
  const mockDispatch = jest.fn();
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();
  const mockFetchUserInfo = jest.fn();
  const mockGetAccessToken = jest.fn();

  // ── beforeEach: reset mocks before each test ────────────────
  // Each test starts with a clean slate. jest.clearAllMocks()
  // resets call counts and return values so tests don't interfere
  // with each other. Then we set up the DEFAULT behavior for this
  // suite: not authenticated, no access token, etc.
  beforeEach(() => {
    // Clear all recorded calls from previous tests
    jest.clearAllMocks();

    // useDispatch returns our mock dispatcher function.
    // When the hook calls dispatch(...), it will call our mock.
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    // useSelector is called by the hook to read the Redux store.
    // By default, return null (no access token stored yet).
    // Individual tests can override this if they need a token.
    (useSelector as unknown as jest.Mock).mockReturnValue(null);

    // useLogto returns all the auth functions from the Logto library.
    // We pass our mocks so we can track calls and control returns.
    // isAuthenticated=false means the default state is NOT logged in.
    (useLogto as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
      isLoading: false,
      fetchUserInfo: mockFetchUserInfo,
      getAccessToken: mockGetAccessToken,
    });
  });

  it('redirects to login if not authenticated', () => {
    // ── ARRANGE ──────────────────────────────────────────────────
    // Setup is done in beforeEach: Logto reports isAuthenticated=false

    // ── ACT ──────────────────────────────────────────────────────
    // Mount the hook into a test environment.
    // The hook's useEffect will check "am I authenticated?" and
    // call signIn() if the answer is no.
    renderHook(() => useAuth());

    // ── ASSERT ───────────────────────────────────────────────────
    // Verify that the hook automatically redirected to login.
    // The redirect URI should be the one from constants (Logto callback URL).
    expect(mockSignIn).toHaveBeenCalledWith(LOGTO_REDIRECT_URI);
  });

  it('fetches user info and access token after authentication', async () => {
    // ── ARRANGE ──────────────────────────────────────────────────
    // Set up the return values from the async Logto functions.
    // mockResolvedValue makes the promises resolve with these values
    // when the hook calls them.
    mockFetchUserInfo.mockResolvedValue({ name: 'Test User' });
    mockGetAccessToken.mockResolvedValue('mock-access-token');

    // Now override the default Logto mock to report that the user
    // IS authenticated (isAuthenticated: true). This triggers the
    // hook's second useEffect, which fetches user info and the token.
    (useLogto as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,  // ← Changed! Triggers data fetch
      isLoading: false,
      fetchUserInfo: mockFetchUserInfo,
      getAccessToken: mockGetAccessToken,
    });

    // ── ACT ──────────────────────────────────────────────────────
    // Mount the hook. When it sees isAuthenticated=true, it will:
    //   1. Call fetchUserInfo() to get the user object
    //   2. Call getAccessToken(resource) to get the JWT token
    //   3. Dispatch these values to Redux
    const { result } = renderHook(() => useAuth());

    // act() ensures all state updates and async operations complete
    // before we check our assertions. Without it, the promises might
    // still be pending when we assert.
    await act(async () => {
      // Wait for all useEffect hooks and promises to settle
    });

    // ── ASSERT ───────────────────────────────────────────────────
    // Verify that the hook performed all the necessary data fetches
    // and stored the results in Redux.
    expect(mockFetchUserInfo).toHaveBeenCalled();
    expect(mockGetAccessToken).toHaveBeenCalledWith(LOGTO_RESOURCE);
    // Verify Redux was updated with the user object
    expect(mockDispatch).toHaveBeenCalledWith(setUser({ name: 'Test User' }));
    // Verify the access token was stored in Redux
    expect(mockDispatch).toHaveBeenCalledWith(
      setAccessToken('mock-access-token'),
    );
  });

  it('persists access token to storage', async () => {
    // ── ARRANGE ──────────────────────────────────────────────────
    // Create a mock storage object to simulate localStorage.
    // This lets us verify that setItem() was called correctly.
    const mockStorage = { setItem: jest.fn() };

    // KEY INSIGHT: useSelector returns the Redux state value.
    // The hook has a useEffect that fires whenever the accessToken
    // changes in Redux. To test this useEffect, we need useSelector
    // to return the token value so the dependency array sees a change.
    //
    // In a real app:
    //   1. Hook dispatches setAccessToken('...')
    //   2. Redux store is updated
    //   3. useSelector re-runs and returns the new token
    //   4. The storage useEffect dependency array detects the change
    //
    // In our test, we mock Redux, so we must manually tell useSelector
    // to return the token value.
    (useSelector as unknown as jest.Mock).mockReturnValue('mock-access-token');

    // Set up Logto to report authenticated.
    (useLogto as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
      isLoading: false,
      fetchUserInfo: mockFetchUserInfo,
      getAccessToken: mockGetAccessToken,
    });

    mockGetAccessToken.mockResolvedValue('mock-access-token');

    // ── ACT ──────────────────────────────────────────────────────
    // Mount the hook with our custom storage object.
    // When the hook sees the accessToken in Redux (from useSelector),
    // it should save it to storage.
    renderHook(() => useAuth({ storage: mockStorage }));

    await act(async () => {
      // Wait for useEffect to run and call storage.setItem()
    });

    // ── ASSERT ───────────────────────────────────────────────────
    // Verify that the hook persisted the token to our custom storage.
    // The token is stored as a JSON string (so it can be retrieved
    // and parsed later).
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      JSON.stringify('mock-access-token'),
    );
  });

  it('provides signIn and signOut functions', () => {
    // ── ARRANGE ──────────────────────────────────────────────────
    // beforeEach already set up the mocks.

    // ── ACT ──────────────────────────────────────────────────────
    // Mount the hook and get the result object.
    // result.current gives us access to the hook's return value,
    // which includes the signIn and signOut functions.
    const { result } = renderHook(() => useAuth());

    // Call signIn from the hook's return value.
    // act() wraps function calls to ensure React updates are batched
    // and applied synchronously before we assert.
    act(() => {
      result.current.signIn();
    });

    // ── ASSERT ───────────────────────────────────────────────────
    // Verify that calling signIn() on the hook delegates to the
    // underlying Logto signIn function with the correct redirect URI.
    expect(mockSignIn).toHaveBeenCalledWith(LOGTO_REDIRECT_URI);

    // Similarly, test signOut.
    act(() => {
      result.current.signOut();
    });
    // Verify that calling signOut() on the hook delegates to Logto.
    expect(mockSignOut).toHaveBeenCalled();
  });
});
 */
