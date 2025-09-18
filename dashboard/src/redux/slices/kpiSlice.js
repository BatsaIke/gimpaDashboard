import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";

const toKey = (v) => (v == null ? "" : String(v));

const initialState = {
  items: [],           // all KPIs (generic list)
  userKpis: {},        // per-user KPIs cache: { [userId: string]: Kpi[] }
  loading: false,      // global loading flag (ok to keep simple)
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
      const { userId, kpis } = action.payload || {};
      const key = toKey(userId);
      if (!state.userKpis) state.userKpis = {};
      state.userKpis[key] = Array.isArray(kpis) ? kpis : [];
    },
    addKpi: (state, action) => {
      state.items.push(action.payload);
    },
    updateKpi: (state, action) => {
      const updated = action.payload;
      // update in generic list
      const i = state.items.findIndex((k) => String(k._id) === String(updated._id));
      if (i !== -1) state.items[i] = updated;

      // update in every cached user list that contains it
      if (state.userKpis) {
        Object.keys(state.userKpis).forEach((uid) => {
          const arr = state.userKpis[uid] || [];
          const j = arr.findIndex((k) => String(k._id) === String(updated._id));
          if (j !== -1) arr[j] = updated;
        });
      }
    },
    updateDeliverableStatus: (state, action) => {
      const { kpiId, deliverableIndex, status } = action.payload;
      // generic list
      const kpi = state.items.find((k) => String(k._id) === String(kpiId));
      if (kpi?.deliverables?.[deliverableIndex]) {
        kpi.deliverables[deliverableIndex].status = status;
      }
      // all cached user lists
      if (state.userKpis) {
        Object.values(state.userKpis).forEach((list) => {
          const uk = list.find((k) => String(k._id) === String(kpiId));
          if (uk?.deliverables?.[deliverableIndex]) {
            uk.deliverables[deliverableIndex].status = status;
          }
        });
      }
    },
    removeKpi: (state, action) => {
      const kpiId = action.payload;
      state.items = state.items.filter((k) => String(k._id) !== String(kpiId));
      if (state.userKpis) {
        Object.keys(state.userKpis).forEach((uid) => {
          state.userKpis[uid] = (state.userKpis[uid] || []).filter(
            (k) => String(k._id) !== String(kpiId)
          );
        });
      }
    },
    setLoading: (state, action) => {
      state.loading = !!action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload || null;
    },
    resetUserKpis: (state) => {
      // keep this action around if other parts rely on it, but DO NOT auto-call it in the thunk
      state.userKpis = {};
    },
    setMovingKpi: (state, action) => {
      state.movingKpiIds.push(action.payload);
    },
    unsetMovingKpi: (state, action) => {
      state.movingKpiIds = state.movingKpiIds.filter((id) => id !== action.payload);
    },
  },
});

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

// Fetch KPIs for a specific user without wiping cache
export const fetchUserKpis = (userId) => async (dispatch) => {
  const key = toKey(userId);
  try {
    dispatch(setLoading(true));
    const response = await api.get(`/kpis/user/${key}`);
    dispatch(setUserKpis({ userId: key, kpis: response.data }));
    return response.data;
  } catch (error) {
    dispatch(setError(error?.message || "Failed to fetch user KPIs"));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export default kpiSlice.reducer;
