import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ConfirmVariant = 'warning' | 'success' | 'error' | 'info';

export interface ConfirmState {
  open: boolean;
  id: string | null;
  title: string | null;
  message: string | null;
  variant: ConfirmVariant;
  confirmText: string;
  cancelText: string | null;
  dismissible: boolean;
  customKey: string | null;
  confirmTextIsHref?: boolean;
  confirmHref?: string;
}

const initialState: ConfirmState = {
  open: false,
  id: null,
  title: null,
  message: null,
  variant: 'warning',
  confirmText: 'OK',
  cancelText: 'Cancel',
  dismissible: true,
  customKey: null,
  confirmTextIsHref: false,
  confirmHref: undefined,
};

const confirmSlice = createSlice({
  name: 'confirm',
  initialState,
  reducers: {
    showConfirm: (
      state,
      action: PayloadAction<Partial<ConfirmState> & { id: string }>
    ) => {
      const payload = action.payload;
      state.open = true;
      state.id = payload.id;
      state.title = payload.title ?? null;
      state.message = payload.message ?? null;
      state.variant = payload.variant ?? 'warning';
      state.confirmText = payload.confirmText ?? 'OK';
      state.cancelText = payload.cancelText ?? 'Cancel';
      state.dismissible = payload.dismissible ?? true;
      state.customKey = payload.customKey ?? null;
      state.confirmTextIsHref = payload.confirmTextIsHref ?? false;
      state.confirmHref = payload.confirmHref ?? undefined;
      try {
        if ((state as any).custom) delete (state as any).custom;
      } catch (e) {
        void e;
      }
    },
    closeConfirm: (state) => {
      state.open = false;
      state.id = null;
      state.title = null;
      state.message = null;
      state.customKey = null;
      state.confirmTextIsHref = false;
      state.confirmHref = undefined;
      try {
        if ((state as any).custom) delete (state as any).custom;
      } catch (e) {
        void e;
      }
    },
  },
});

export const { showConfirm, closeConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;
