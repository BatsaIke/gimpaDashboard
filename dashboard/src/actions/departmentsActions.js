// src/actions/departmentsActions.js
import api from "../api"; // Axios instance
import {
  setDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  setLoading,
} from "../redux/slices/departmentSlice";
import apiErrorHandler from "../utils/apiHandleError"; // Centralized error handler

/** =========================
 * Scoped (or all) departments for page lists
 * ========================== */
export const fetchDepartments = (scope = "mine") => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const url = `/departments/scope?scope=${encodeURIComponent(scope)}`;
    const { data } = await api.get(url);
    dispatch(setDepartments(data));
    return { success: true, data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// Optional: Top-4 only
export const fetchAllDepartments = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.get("/departments/scope?scope=all");
    dispatch(setDepartments(data));
    return { success: true, data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/** =========================
 * CRUD
 * ========================== */
export const createDepartment = (departmentData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/departments", departmentData);
    dispatch(addDepartment(response.data.department));
    return { success: true, department: response.data.department };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const editDepartment =
  ({ id, name, description, category }) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await api.patch(`/departments/${id}`, {
        name,
        description,
        category,
      });
      dispatch(updateDepartment(response.data.department));
      return { success: true, department: response.data.department };
    } catch (error) {
      apiErrorHandler(dispatch, error);
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };

export const removeDepartment = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/departments/${id}`);
    dispatch(deleteDepartment(id));
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/** =========================
 * “My” scoped list
 * ========================== */
export const fetchMyDepartments = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/departments/my");
    dispatch(setDepartments(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/** Convenience wrapper */
export const fetchDepartmentsScoped = (isTop) => async (dispatch) => {
  return isTop ? dispatch(fetchDepartments()) : dispatch(fetchMyDepartments());
};

/** =========================
 * NEW: Lazy level for Create User/Employee form
 * - parent: null/undefined → roots
 * - parent: "deptId"      → parent + direct children
 * Returns data only; DOES NOT mutate the departments slice.
 * ========================== */
export const fetchDepartmentsForCreateUser =
  ({ parent = null, scope = "mine" } = {}) =>
  async () => {
    try {
      const params = {};
      if (parent) params.parent = parent;
      if (scope) params.scope = scope; // harmless for non-top

      const { data } = await api.get("/departments/create-user", { params });
      // shape: [{ _id, name, selectable: boolean, hasChildren: boolean }]
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || "Failed to load departments",
      };
    }
  };
