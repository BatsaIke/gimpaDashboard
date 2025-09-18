// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getInitialAuthState = () => ({
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isAuthenticated:
    typeof localStorage !== 'undefined' ? !!localStorage.getItem('token') : false,
  loading: false,
  error: null,
  user: null,
  users: [],
  role: null,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof localStorage !== 'undefined') {
        if (action.payload) localStorage.setItem('token', action.payload);
        else localStorage.removeItem('token');
      }
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      if (typeof localStorage !== 'undefined') {
        if (action.payload) localStorage.setItem('refreshToken', action.payload);
        else localStorage.removeItem('refreshToken');
      }
    },
    setRole: (state, action) => {
      state.role = action.payload ?? null;
    },
    setLoading: (state, action) => {
      state.loading = !!action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload ?? null;
    },
    setUser: (state, action) => {
      state.user = action.payload ?? null;
      // keep role in sync if present in the user payload
      if (action.payload && action.payload.role !== undefined) {
        state.role = action.payload.role;
      }
    },
    setUsers: (state, action) => {
      state.users = Array.isArray(action.payload) ? action.payload : [];
    },
    resetAuth: (state) => {
      // lightweight reset: keep tokens, clear volatile fields
      state.loading = false;
      state.error = null;
      state.user = null;
      state.role = null;
    },
    resetAuthState: () => {
      // full reset to whatever is currently in storage (fresh read)
      return getInitialAuthState();
    },
    logout: () => {
      // clear storage and return a clean, unauthenticated state
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return {
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        user: null,
        users: [],
        role: null,
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
