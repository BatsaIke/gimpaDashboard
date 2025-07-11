// src/actions/discrepancyActions.js
import api from "../api";
import {
  setLoading, setError, setList,
  addFlag, markBooked, clearFlag
} from "../redux/slices/discrepancySlice";
import apiErrorHandler from "../utils/apiHandleError";

// src/actions/discrepancyActions.js
export const fetchDiscrepancies = (kpiId) => async dispatch => {
  dispatch(setLoading(true));
  try {
    // if you pass in kpiId, hit /discrepancies/:kpiId
    const url = kpiId
      ? `/discrepancies/${kpiId}`
      : `/discrepancies`;
    const { data } = await api.get(url);
    dispatch(setList(data));
  } catch (err) {
    apiErrorHandler(dispatch, err);
    dispatch(setError(err.message));
  } finally {
    dispatch(setLoading(false));
  }
};


export const bookMeeting = (flagId, { date, notes }) => async dispatch => {
  if (!flagId) {
    dispatch(setError("Invalid discrepancy ID"));
    return false;
  }

  dispatch(setLoading(true));
  try {
    const { data } = await api.put(`/discrepancies/${flagId}/book`, { date, notes });

    // dispatch with the same `flagId` you just passed in:
    dispatch(markBooked({
      id:          flagId,                      // ← use flagId here
      meetingDate: data.meeting.timestamp,
      notes:       data.meeting.notes
    }));

    return true;
  } catch (err) {
    apiErrorHandler(dispatch, err);
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};


export const resolveDiscrepancy = (flagId, resolutionNotes) => async dispatch => {
  if (!flagId) {
    dispatch(setError("Invalid discrepancy ID"));
    return false;
  }

  dispatch(setLoading(true));
  try {
    // Send { resolutionNotes: "..." }
    await api.put(`/discrepancies/${flagId}/resolve`, { resolutionNotes });
    dispatch(clearFlag({ id: flagId }));
    return true;
  } catch (err) {
    apiErrorHandler(dispatch, err);
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};



