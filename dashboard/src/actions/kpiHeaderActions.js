import api from "../api";
import {
  setKpiHeaders,
  addKpiHeader,
  updateKpiHeader,
  removeKpiHeader,
  setLoading,
  setError,
} from "../redux/slices/kpiHeaderSlice";
import apiErrorHandler from "../utils/apiHandleError";

/**
 * Fetch all KPI Headers
 * Optionally, pass a userId to see that user's perspective
 */
export const fetchKpiHeaders = (viewUserId = null) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const url = viewUserId
      ? `/kpi-headers?viewUserId=${viewUserId}`
      : "/kpi-headers";
    const response = await api.get(url);
    dispatch(setKpiHeaders(response.data));
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Create a KPI Header
 */
export const createKpiHeader = (headerData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/kpi-headers", headerData);
    dispatch(addKpiHeader(response.data.header));
    return { success: true, header: response.data.header };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Update a KPI Header
 */
export const editKpiHeader = (id, updates) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.patch(`/kpi-headers/${id}`, updates);
    dispatch(updateKpiHeader(response.data.header));
    return { success: true, header: response.data.header };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Delete a KPI Header
 */
export const deleteKpiHeader = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/kpi-headers/${id}`);
    dispatch(removeKpiHeader(id));
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};
