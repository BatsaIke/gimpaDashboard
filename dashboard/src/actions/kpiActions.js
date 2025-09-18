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
import buildKpiFormData from "../utils/buildKpiFormData";

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
    const hasFiles = Array.isArray(updates.files) && updates.files.length > 0;

    const body   = hasFiles ? buildKpiFormData(updates) : updates;
    const config = hasFiles
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined;

    const { data } = await api.patch(`/kpis/${id}`, body, config);
    dispatch(updateKpi(data.kpi));
    return { success: true, kpi: data.kpi };
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
export const uploadKpiEvidence = (kpiId, { file, deliverableId, occurrenceLabel, assigneeId }) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    if (!file) throw new Error("No file provided.");
    if (!deliverableId) throw new Error("deliverableId is required.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("deliverableId", String(deliverableId));
    if (occurrenceLabel) formData.append("occurrenceLabel", String(occurrenceLabel));
    if (assigneeId) formData.append("assigneeId", String(assigneeId));

    const { data } = await api.post(`/kpis/${kpiId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Preferred: server includes the uploaded URL directly
    // e.g. res.json({ message, uploadedUrl, kpi })
    let filePath =
      data?.uploadedUrl ||
      data?.url ||
      data?.filePath ||
      null;

    // Fallback: derive the URL from the returned caller-shaped KPI payload
    if (!filePath && data?.kpi?.deliverables && Array.isArray(data.kpi.deliverables)) {
      const d = data.kpi.deliverables.find((x) => String(x._id) === String(deliverableId));
      if (d) {
        if (occurrenceLabel && Array.isArray(d.occurrences)) {
          const occ = d.occurrences.find((o) => o?.periodLabel === occurrenceLabel);
          if (occ && Array.isArray(occ.evidence) && occ.evidence.length) {
            filePath = occ.evidence[occ.evidence.length - 1];
          }
        } else if (Array.isArray(d.evidence) && d.evidence.length) {
          filePath = d.evidence[d.evidence.length - 1];
        }
      }
    }

    if (!filePath) {
      // We saved on the server, but couldn't compute the exact URL—still return success
      // so the caller can refetch KPIs. If you want strict behavior, flip success:false.
      return { success: true, filePath: null };
    }

    return { success: true, filePath };
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || "Upload failed";
    dispatch(setError(msg));
    return { success: false, error: msg };
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