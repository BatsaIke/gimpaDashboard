import { createSlice } from '@reduxjs/toolkit';

const authInitialState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  user: null,
   users: [], 
  role: null, // track user role here
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      localStorage.setItem("refreshToken", action.payload);
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    resetAuth: (state) => {
      state.loading = false;
      state.error = null;
      state.user = null;
      state.role = null;
    },
    resetAuthState: () => {
      return authInitialState;
    },
   logout: () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return {
    ...authInitialState,
    token: null,
    refreshToken: null,
   user: null,
    role: null,
    isAuthenticated: false
  };
    },
  },
});

export const {
  setToken,
  setRole,
  setLoading,
  setError,
  setUser,
  setUsers,
  resetAuth,
  resetAuthState,
  setRefreshToken,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
