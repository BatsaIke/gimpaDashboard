// src/redux/slices/discrepancySlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],    // Each item is a discrepancy (per user, per deliverable)
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "discrepancies",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    setList: (state, action) => {
      state.list = action.payload.map(flag => ({
        id:       flag._id,
        kpiId:    flag.kpiId,
        delIndex: flag.deliverableIndex,
        assigneeId: flag.assigneeId,         // ✅ added for filtering per user

        resolved:     flag.resolved,
        meeting:      flag.meeting || null,
        assigneeScore: flag.assigneeScore,
        creatorScore:  flag.creatorScore,
        flaggedAt:     flag.flaggedAt,
        history:       flag.history,
        reason:        flag.reason,
        resolutionNotes: flag.resolutionNotes || "",
        
        needsMeeting: !flag.resolved,
        booked:       !!flag.meeting,
        meetingDate:  flag.meeting?.timestamp || null,
        notes:        flag.meeting?.notes || "",
      }));
    },

    addFlag: (state, action) => {
      const f   = action.payload;
      const idx = state.list.findIndex(x => x.id === f._id);
      const entry = {
        id:           f._id,
        kpiId:        f.kpiId,
        delIndex:     f.deliverableIndex,
        assigneeId:   f.assigneeId,          // ✅ track who owns the flag
        needsMeeting: !f.resolved,
        booked:       !!f.meeting,
        meetingDate:  f.meeting?.timestamp || null,
        notes:        f.meeting?.notes || "",
      };
      if (idx === -1) state.list.push(entry);
      else            state.list[idx] = entry;
    },

    markBooked: (state, action) => {
      const { id, meetingDate, notes } = action.payload;
      const f = state.list.find(x => x.id === id);
      if (f) {
        f.booked      = true;
        f.meetingDate = meetingDate;
        f.notes       = notes;
      }
    },

    clearFlag: (state, action) => {
      const { id } = action.payload;
      state.list = state.list.filter(f => f.id !== id);
    },
  },
});

export const {
  setLoading,
  setError,
  setList,
  addFlag,
  markBooked,
  clearFlag
} = slice.actions;

export default slice.reducer;
