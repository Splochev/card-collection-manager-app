import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ICard } from '@card-collection-manager-app/shared';

export type GroupByType = 'cardName' | 'setName' | 'setCode';
export type OrderByType = 'cardName' | 'setName' | 'setCode' | 'count';
export type SortType = 'ASC' | 'DESC';
export type ViewMode = 'grid' | 'list';

export interface CollectionGroup {
  groupKey: string;
  totalCount: number;
  cards: ICard[];
}

export interface CollectionState {
  groups: CollectionGroup[];
  groupBy: GroupByType;
  orderBy: OrderByType;
  sortType: SortType;
  viewMode: ViewMode;
  filter: string;
  offset: number;
  limit: number;
  totalGroups: number;
  hasMore: boolean;
  isLoading: boolean;
}

const initialState: CollectionState = {
  groups: [],
  groupBy: 'setName',
  orderBy: 'cardName',
  sortType: 'ASC',
  viewMode: 'grid',
  filter: '',
  offset: 0,
  limit: 5,
  totalGroups: 0,
  hasMore: false,
  isLoading: false,
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<CollectionGroup[]>) => {
      state.groups = action.payload;
    },
    appendGroups: (state, action: PayloadAction<CollectionGroup[]>) => {
      state.groups = [...state.groups, ...action.payload];
    },
    setGroupBy: (state, action: PayloadAction<GroupByType>) => {
      state.groupBy = action.payload;
      state.offset = 0;
      state.groups = [];
    },
    setOrderBy: (state, action: PayloadAction<OrderByType>) => {
      state.orderBy = action.payload;
      state.offset = 0;
      state.groups = [];
    },
    setSortType: (state, action: PayloadAction<SortType>) => {
      state.sortType = action.payload;
      state.offset = 0;
      state.groups = [];
    },
    toggleSortType: (state) => {
      state.sortType = state.sortType === 'ASC' ? 'DESC' : 'ASC';
      state.offset = 0;
      state.groups = [];
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
      state.offset = 0;
      state.groups = [];
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    incrementOffset: (state) => {
      state.offset += state.limit;
    },
    setTotalGroups: (state, action: PayloadAction<number>) => {
      state.totalGroups = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetCollection: (state) => {
      state.groups = [];
      state.offset = 0;
      state.totalGroups = 0;
      state.hasMore = false;
    },
    updateCardCount: (
      state,
      action: PayloadAction<{
        cardId: number;
        cardNumber: string;
        newCount: number;
      }>
    ) => {
      const { cardId, cardNumber, newCount } = action.payload;

      state.groups.forEach((group) => {
        const cardIndex = group.cards.findIndex(
          (c) => c.id === cardId || c.cardNumber === cardNumber
        );
        if (cardIndex !== -1) {
          group.cards[cardIndex].count = newCount;
        }
      });
    },
  },
});

export const {
  setGroups,
  appendGroups,
  setGroupBy,
  setOrderBy,
  setSortType,
  toggleSortType,
  setViewMode,
  setFilter,
  setOffset,
  incrementOffset,
  setTotalGroups,
  setHasMore,
  setIsLoading,
  resetCollection,
  updateCardCount,
} = collectionSlice.actions;

export default collectionSlice.reducer;
