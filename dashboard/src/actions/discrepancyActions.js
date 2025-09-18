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
    const url = kpiId ? `/discrepancies/${kpiId}` : `/discrepancies`;
    const { data } = await api.get(url);
    dispatch(setList(data));
    return data; // <-- return so .then() in component can use it
  } catch (err) {
    apiErrorHandler(dispatch, err);
    dispatch(setError(err.message));
    throw err; // <-- so .catch() works
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


// src/actions/discrepancyActions.js
export const resolveDiscrepancy =
  (flagId, { newScore, resolutionNotes, file }) =>
  async (dispatch) => {
    if (!flagId) {
      dispatch(setError("Invalid discrepancy ID"));
      return false;
    }

    dispatch(setLoading(true));
    try {
      const form = new FormData();
      form.append("newScore",        String(newScore));
      form.append("resolutionNotes", resolutionNotes);
      if (file) form.append("file", file);

      await api.put(`/discrepancies/${flagId}/resolve`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(clearFlag({ id: flagId }));
      return true;
    } catch (err) {
      apiErrorHandler(dispatch, err);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };




