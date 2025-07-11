import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const initialState = {
  items: [], // List of all KPIs
  userKpis: {}, // Object to store KPIs by user ID
  loading: false,
  error: null,
  movingKpiIds: [],
};

const kpiSlice = createSlice({
  name: "kpis",
  initialState,
  reducers: {
    setKpis: (state, action) => {
      state.items = action.payload;
    },
    setUserKpis: (state, action) => {
      const { userId, kpis } = action.payload;
      // Safely initialize userKpis if undefined
      if (!state.userKpis) {
        state.userKpis = {};
      }
      state.userKpis[userId] = kpis;
    },
    addKpi: (state, action) => {
      state.items.push(action.payload);
    },
    updateKpi: (state, action) => {
      const updated = action.payload;
      const index = state.items.findIndex((kpi) => kpi._id === updated._id);
      if (index !== -1) {
        state.items[index] = updated;
      }
      // Safely update in userKpis if present
      if (state.userKpis) {
        Object.keys(state.userKpis).forEach(userId => {
          const userIndex = state.userKpis[userId]?.findIndex(k => k._id === updated._id);
          if (userIndex !== -1) {
            state.userKpis[userId][userIndex] = updated;
          }
        });
      }
    },
    updateDeliverableStatus: (state, action) => {
      const { kpiId, deliverableIndex, status } = action.payload;
      // Update in main items
      const kpi = state.items.find((k) => k._id === kpiId);
      if (kpi && kpi.deliverables[deliverableIndex]) {
        kpi.deliverables[deliverableIndex].status = status;
      }
      // Safely update in userKpis if present
      if (state.userKpis) {
        Object.keys(state.userKpis).forEach(userId => {
          const userKpi = state.userKpis[userId]?.find(k => k._id === kpiId);
          if (userKpi && userKpi.deliverables[deliverableIndex]) {
            userKpi.deliverables[deliverableIndex].status = status;
          }
        });
      }
    },
    removeKpi: (state, action) => {
      const kpiId = action.payload;
      state.items = state.items.filter((kpi) => kpi._id !== kpiId);
      // Safely remove from userKpis if present
      if (state.userKpis) {
        Object.keys(state.userKpis).forEach(userId => {
          state.userKpis[userId] = state.userKpis[userId]?.filter(k => k._id !== kpiId) || [];
        });
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Add a reset action for userKpis
    resetUserKpis: (state) => {
      state.userKpis = {};
    },
    setMovingKpi: (state, action) => {
      state.movingKpiIds.push(action.payload);
    },
    unsetMovingKpi: (state, action) => {
      state.movingKpiIds = state.movingKpiIds.filter(id => id !== action.payload);
    },
  },
});

// Action creators
export const {
  setKpis,
  setUserKpis,
  addKpi,
  updateKpi,
  removeKpi,
  updateDeliverableStatus,
  setLoading,
  setError,
  setMovingKpi,
  unsetMovingKpi,
  resetUserKpis,
} = kpiSlice.actions;

// Thunk action for fetching user KPIs
export const fetchUserKpis = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(resetUserKpis()); // Clear previous user KPIs
    
    const response = await api.get(`/kpis/user/${userId}`);
    dispatch(setUserKpis({
      userId,
      kpis: response.data
    }));
    
    return response.data;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export default kpiSlice.reducer;