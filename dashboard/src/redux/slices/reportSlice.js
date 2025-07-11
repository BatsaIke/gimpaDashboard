import { createSlice } from "@reduxjs/toolkit"; // Ensure this import is present

const initialState = {
  reports: {
    totalOrders: 0,
    totalCustomers: 0,
    successfulOrders: 0,
    totalSales: 0,
    salesData: [],
  },
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReports(state, action) {
      state.reports = action.payload || state.reports; // Use current state as fallback
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setReports, setLoading, setError } = reportsSlice.actions;
export default reportsSlice.reducer;
