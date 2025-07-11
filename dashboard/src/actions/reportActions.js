import api from "../api";
import { setReports, setLoading, setError } from "../redux/slices/reportSlice";
import apiErrorHandler from "../utils/apiHandleError";

export const fetchReports = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/reports");
    if (response.status === 200 && response.data.success) {
      dispatch(setReports(response.data.report)); // Dispatch the 'report' object
      return { success: true, reports: response.data.report };
    } else {
      dispatch(setError("Failed to fetch reports."));
      return { success: false, message: "Failed to fetch reports." };
    }
  } catch (error) {
    apiErrorHandler(error, dispatch);
    return { success: false, message: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};
