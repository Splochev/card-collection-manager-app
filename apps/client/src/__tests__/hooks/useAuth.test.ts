import { renderHook, act } from '@testing-library/react';
import { useLogto } from '@logto/react';
import { useAuth, UseAuthOptions } from '../../hooks/useAuth';
import { LOGTO_REDIRECT_URI, LOGTO_RESOURCE } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setUser } from '../../stores/userSlice';

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

describe('useAuth', () => {
  let mockOptions: UseAuthOptions = undefined as unknown as UseAuthOptions;
  const mockStorage = {
    setItem: jest.fn().mockResolvedValue(undefined),
  };
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();
  const mockFetchUserInfo = jest.fn();
  const mockGetAccessToken = jest.fn();
  const mockDispatch = jest.fn();
  const mockSelector = jest.fn();
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
    (mockGetAccessToken as jest.Mock).mockResolvedValue('test');

    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockReturnValue(mockSelector);

    mockOptions = {
      redirectUri: LOGTO_REDIRECT_URI,
      resource: LOGTO_RESOURCE,
      enabled: true,
      storage: mockStorage,
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
    expect(mockDispatch).toHaveBeenCalledWith(setUser(mockUser));
    expect(mockDispatch).toHaveBeenCalledWith(setAccessToken('test'));
  });

  it('sets accessToken in storage', async () => {
    // Track what gets dispatched
    let dispatchedAccessToken: string | null = null;
    mockDispatch.mockImplementation((action) => {
      // If setAccessToken is dispatched, capture the payload
      if (action?.payload !== undefined && typeof action.payload === 'string') {
        dispatchedAccessToken = action.payload;
      }
    });

    // Have useSelector return the dispatched token
    (useSelector as unknown as jest.Mock).mockImplementation(
      () => dispatchedAccessToken,
    );

    const { rerender } = await act(() => {
      return renderHook(() => useAuth(mockOptions));
    });

    // After effects complete and dispatch runs, rerender to get the new value
    await act(async () => {
      rerender();
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      JSON.stringify('test'),
    );
  });

  it('provides signIn and signOut functions', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn();
    });

    expect(mockSignIn).toHaveBeenCalledWith(LOGTO_REDIRECT_URI);

    act(() => {
      result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
});
