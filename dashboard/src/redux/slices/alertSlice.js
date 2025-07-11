import { createSlice } from '@reduxjs/toolkit';

const alertSlice = createSlice({
  name: 'alerts',
  initialState: [],
  reducers: {
    setAlert: (state, action) => {
      return [...state, action.payload];
    },
    removeAlert: (state, action) => {
      return state.filter((alert) => alert.id !== action.payload);
    },
  },
});

export const { setAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;
