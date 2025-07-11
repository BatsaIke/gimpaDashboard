import api from "../api"; // Axios instance
import {
  setDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  setLoading,
  setError,
} from "../redux/slices/departmentSlice";
import apiErrorHandler from "../utils/apiHandleError"; // Centralized error handler

/**
 * Fetch all departments
 * Matches: GET /departments
 */
export const fetchDepartments = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/departments");
    dispatch(setDepartments(response.data)); // Populate the items array
    return { success: true, data: response.data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Create a new department
 * Matches: POST /departments
 */
export const createDepartment = (departmentData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/departments", departmentData);
    dispatch(addDepartment(response.data.department)); // Add the new department to the store
    return { success: true, department: response.data.department };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Update a department
 * Matches: PATCH /departments/:id
 */
export const editDepartment = ({ id, name, description, category }) => async (dispatch) => {
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


/**
 * Delete a department
 * Matches: DELETE /departments/:id
 */
export const removeDepartment = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/departments/${id}`);
    dispatch(deleteDepartment(id)); // Remove the department from the store
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};
