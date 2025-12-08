import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IStorage, storageService } from '../services/storage';

/**
 * Storage instance for user slice.
 * Can be overridden for testing purposes.
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
  user: unknown;
  accessToken: string | null;
}

const getInitialUser = (): unknown => {
  const saved = storage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

const getInitialAccessToken = (): string | null => {
  const saved = storage.getItem('accessToken');
  return saved ? JSON.parse(saved) : null;
};

const initialState: UserState = {
  user: getInitialUser(),
  accessToken: getInitialAccessToken(),
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
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      const newAccessToken = action.payload;
      storage.setItem('accessToken', JSON.stringify(newAccessToken));
      state.accessToken = newAccessToken;
    },
    clearUser: (state) => {
      storage.removeItem('user');
      storage.removeItem('accessToken');
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, setAccessToken, clearUser } = userSlice.actions;
export default userSlice.reducer;
