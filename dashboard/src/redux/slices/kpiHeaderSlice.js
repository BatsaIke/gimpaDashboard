import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // List of KPI Headers
  loading: false,
  error: null,
};

const kpiHeaderSlice = createSlice({
  name: "kpiHeaders",
  initialState,
  reducers: {
    setKpiHeaders: (state, action) => {
      state.items = action.payload;
    },
    addKpiHeader: (state, action) => {
      state.items.push(action.payload);
    },
    updateKpiHeader: (state, action) => {
      const updated = action.payload;
      const index = state.items.findIndex((header) => header._id === updated._id);
      if (index !== -1) {
        state.items[index] = updated;
      }
    },
    removeKpiHeader: (state, action) => {
      state.items = state.items.filter((header) => header._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setKpiHeaders,
  addKpiHeader,
  updateKpiHeader,
  removeKpiHeader,
  setLoading,
  setError,
} = kpiHeaderSlice.actions;

export default kpiHeaderSlice.reducer;