import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

const getInitialAccessToken = () => {
  const saved = localStorage.getItem('accessToken');
  return saved ? JSON.parse(saved) : null;
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: getInitialUser(),
    accessToken: getInitialAccessToken(),
  },
  reducers: {
    setUser: (state, action) => {
      const newUser = action.payload;
      localStorage.setItem('user', JSON.stringify(newUser));
      state.user = newUser;
    },
    setAccessToken: (state, action) => {
      const newAccessToken = action.payload;
      localStorage.setItem('accessToken', JSON.stringify(newAccessToken));
      state.accessToken = newAccessToken;
    },
  },
});

export const { setUser, setAccessToken } = userSlice.actions;
export default userSlice.reducer;
