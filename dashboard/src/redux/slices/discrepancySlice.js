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
        id:              flag._id,
        kpiId:           flag.kpiId,
        delIndex:        flag.deliverableIndex,
        assigneeId:      flag.assigneeId,
        occurrenceLabel: flag.occurrenceLabel || null,

        resolved:        flag.resolved,
        meeting:         flag.meeting || null, // Ensure the full meeting object is stored
        assigneeScore:   flag.assigneeScore,
        creatorScore:    flag.creatorScore,
        previousScore:   flag.previousScore || null,
        resolvedScore:   flag.resolvedScore || null,

        flaggedAt:       flag.flaggedAt,
        history:         flag.history,
        reason:          flag.reason,
        resolutionNotes: flag.resolutionNotes || "",

        needsMeeting:    !flag.resolved,
        booked:          !!flag.meeting, // Explicitly set `booked` for consistency
        meetingDate:     flag.meeting?.timestamp || null,
        notes:           flag.meeting?.notes || "",
      }));
    },

    addFlag: (state, action) => {
      const f   = action.payload;
      const idx = state.list.findIndex(x => x.id === f._id);
      const entry = {
        id:              f._id,
        kpiId:           f.kpiId,
        delIndex:        f.deliverableIndex,
        assigneeId:      f.assigneeId,
        occurrenceLabel: f.occurrenceLabel || null,

        resolved:        f.resolved,
        meeting:         f.meeting || null, // Store the full meeting object here too
        assigneeScore:   f.assigneeScore,
        creatorScore:    f.creatorScore,
        previousScore:   f.previousScore || null,
        resolvedScore:   f.resolvedScore || null,

        flaggedAt:       f.flaggedAt,
        history:         f.history || [],
        reason:          f.reason,
        resolutionNotes: f.resolutionNotes || "",

        needsMeeting:    !f.resolved,
        booked:          !!f.meeting, // Explicitly set `booked`
        meetingDate:     f.meeting?.timestamp || null,
        notes:           f.meeting?.notes || "",
      };

      if (idx === -1) state.list.push(entry);
      else            state.list[idx] = entry;
    },

    markBooked: (state, action) => {
      const { id, meetingDate, notes } = action.payload;
      const f = state.list.find(x => x.id === id);
      if (f) {
        f.booked        = true; // Update `booked` flag
        f.meeting       = { timestamp: meetingDate, notes: notes }; // Update the actual `meeting` object
        f.meetingDate   = meetingDate;
        f.notes         = notes;
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
  clearFlag,
} = slice.actions;

export default slice.reducer;