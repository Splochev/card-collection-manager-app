import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('themeMode');
  return saved === 'dark' ? 'dark' : 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state, action) => {
      const newMode =
        action.payload || (state.mode === 'light' ? 'dark' : 'light');
      state.mode = newMode;
      localStorage.setItem('themeMode', newMode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
