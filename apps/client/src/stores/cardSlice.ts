import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ICard } from '@card-collection-manager-app/shared';

export interface CardsState {
  cardSetPrefix: string | null;
  cardsList: ICard[];
  selectedCardNumber: string | null;
}

const initialState: CardsState = {
  cardSetPrefix: null,
  cardsList: [],
  selectedCardNumber: null,
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCardsData: (
      state,
      action: PayloadAction<{ cardSetPrefix: string; cardsList: ICard[] }>
    ) => {
      state.cardSetPrefix = action.payload.cardSetPrefix;
      state.cardsList = action.payload.cardsList;
    },
    clearCardsData: (state) => {
      state.cardSetPrefix = null;
      state.cardsList = [];
    },
    updateCardCount: (
      state,
      action: PayloadAction<{ cardId: number; count: number }>
    ) => {
      const card = state.cardsList.find((c) => c.id === action.payload.cardId);
      if (card) {
        card.count = action.payload.count;
      }
    },
    updateCardWishlist: (
      state,
      action: PayloadAction<{ cardNumber: string; wishlistCount: number }>
    ) => {
      const card = state.cardsList.find(
        (c) =>
          c.cardNumber?.toUpperCase() ===
          action.payload.cardNumber.toUpperCase()
      );
      if (card) {
        card.wishlistCount = action.payload.wishlistCount;
      }
    },
    setSelectedCardNumber: (state, action: PayloadAction<string | null>) => {
      state.selectedCardNumber = action.payload;
    },
  },
});

export const {
  setCardsData,
  clearCardsData,
  updateCardCount,
  updateCardWishlist,
  setSelectedCardNumber,
} = cardsSlice.actions;
export default cardsSlice.reducer;
