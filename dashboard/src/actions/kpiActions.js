// src/actions/kpiActions.js

import api from "../api";
import {
  setKpis,
  addKpi,
  updateKpi,
  removeKpi,
  setLoading,
  setError,
  setUserKpis,
} from "../redux/slices/kpiSlice";
import apiErrorHandler from "../utils/apiHandleError";

/**
 * 1️⃣ Fetch all KPIs
 */
export const fetchKpis = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/kpis");
    dispatch(setKpis(response.data));
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
 * 2️⃣ Create a KPI
 */
export const createKpi = (kpiData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/kpis", kpiData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch(addKpi(response.data.kpi));
    return { success: true, kpi: response.data.kpi };
  } catch (error) {
    console.error("❌ KPI Creation Failed:", error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 3️⃣ Update deliverables only (status updates moved)
 */
export const editKpiDeliverables = (id, updates) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.patch(`/kpis/${id}`, updates);
    dispatch(updateKpi(response.data.kpi));
    return { success: true, kpi: response.data.kpi };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 3️⃣.1 Update status only
 */
export const updateKpiStatusOnly = (id, { status, promoteGlobally = true, assigneeId }) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.patch(`/kpis/${id}/status`, {
      status,
      promoteGlobally,
      assigneeId,
    });
    dispatch(updateKpi({ _id: id, status: response.data.status }));
    return { success: true, status: response.data.status };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 4️⃣ Delete a KPI
 */
export const deleteKpi = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/kpis/${id}`);
    dispatch(removeKpi(id));
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
 * 5️⃣ Upload Evidence File for a KPI
 */
export const uploadKpiEvidence = (id, file) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/kpis/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { success: true, filePath: response.data.filePath };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 6️⃣ Fetch KPIs for a specific user
 */
export const fetchUserKpis = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/kpis/user/${userId}`);
    dispatch(setUserKpis({ userId, kpis: response.data }));
    return { success: true, kpis: response.data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setError(error.message));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};