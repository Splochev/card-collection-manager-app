import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import cardsReducer from './cardSlice';
import confirmReducer from './confirmSlice';
import userSlice from './userSlice';
import collectionReducer from './collectionSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    cards: cardsReducer,
    confirm: confirmReducer,
    user: userSlice,
    collection: collectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
