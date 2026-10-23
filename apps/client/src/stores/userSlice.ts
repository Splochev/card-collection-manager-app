import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IStorage, storageService } from '../services/storage';

/**
 * Storage instance for user slice.
 * Can be overridden for testing purposes.
 * Only the user profile is persisted; the access token lives in an
 * httpOnly cookie managed by the backend and is never exposed to JS.
 */
let storage: IStorage = storageService;

/**
 * Sets the storage implementation. Useful for testing.
 */
export const setUserSliceStorage = (newStorage: IStorage): void => {
  storage = newStorage;
};

/**
 * Resets storage to default. Useful for testing cleanup.
 */
export const resetUserSliceStorage = (): void => {
  storage = storageService;
};

export interface UserState {
  user: any;
  /**
   * Whether the backend has set the auth cookie for this session.
   * API requests should only be made once this is true.
   */
  isSessionReady: boolean;
}

const getInitialUser = (): any => {
  const saved = storage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

const initialState: UserState = {
  user: getInitialUser(),
  isSessionReady: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<unknown>) => {
      const newUser = action.payload;
      storage.setItem('user', JSON.stringify(newUser));
      state.user = newUser;
    },
    setSessionReady: (state, action: PayloadAction<boolean>) => {
      state.isSessionReady = action.payload;
    },
    clearUser: (state) => {
      storage.removeItem('user');
      state.user = null;
      state.isSessionReady = false;
    },
  },
});

export const { setUser, setSessionReady, clearUser } = userSlice.actions;
export default userSlice.reducer;
