// src/actions/departmentRolesActions.js
import api from "../api";
import apiErrorHandler from "../utils/apiHandleError";

import {
  setDeptRoles,
  setDeptRolesLoading,
  setDeptRolesError,
  addDeptRole,
  updateDeptRoleLocal,
  deleteDeptRoleLocal,
  setAssignments,
  setAssignmentsLoading,
  setAssignmentsError,
  upsertAssignmentLocal,
} from "../redux/slices/departmentRolesSlice";

export const fetchDeptRoles = (departmentId, { force = false } = {}) => async (dispatch) => {
  dispatch(setDeptRolesLoading({ departmentId, loading: true }));
  try {
    console.log("[actions] GET /departments/%s/roles", departmentId);
    const { data } = await api.get(`/departments/${departmentId}/roles`);
    console.log("[actions] roles len:", Array.isArray(data) ? data.length : "n/a");
    dispatch(setDeptRoles({ departmentId, roles: data }));
    return { success: true, data };
  } catch (error) {
    console.log("[actions] fetchDeptRoles ERROR:", error?.response?.status, error?.response?.data);
    apiErrorHandler(dispatch, error);
    dispatch(setDeptRolesError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setDeptRolesLoading({ departmentId, loading: false }));
  }
};


export const createDeptRole = (departmentId, payload) => async (dispatch) => {
  dispatch(setDeptRolesLoading({ departmentId, loading: true }));
  try {
    const { data } = await api.post(`/departments/${departmentId}/roles`, payload);
    dispatch(addDeptRole({ departmentId, role: data.role }));
    return { success: true, role: data.role };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setDeptRolesError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setDeptRolesLoading({ departmentId, loading: false }));
  }
};

export const updateDeptRole = (departmentId, roleId, payload) => async (dispatch) => {
  dispatch(setDeptRolesLoading({ departmentId, loading: true }));
  try {
    const { data } = await api.put(`/departments/${departmentId}/roles/${roleId}`, payload);
    dispatch(updateDeptRoleLocal({ departmentId, role: data.role }));
    return { success: true, role: data.role };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setDeptRolesError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setDeptRolesLoading({ departmentId, loading: false }));
  }
};

export const deleteDeptRole = (departmentId, roleId) => async (dispatch) => {
  dispatch(setDeptRolesLoading({ departmentId, loading: true }));
  try {
    await api.delete(`/departments/${departmentId}/roles/${roleId}`);
    dispatch(deleteDeptRoleLocal({ departmentId, roleId }));
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setDeptRolesError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setDeptRolesLoading({ departmentId, loading: false }));
  }
};

export const setAssignmentsFromExternal = (departmentId, items) => (dispatch) => {
  dispatch(setAssignments({ departmentId, items }));
};

export const assignDeptRole = (departmentId, payload) => async (dispatch) => {
  dispatch(setAssignmentsLoading({ departmentId, loading: true }));
  try {
    const { data } = await api.post(`/departments/${departmentId}/roles/assign`, payload);
    dispatch(upsertAssignmentLocal({ departmentId, assignment: data.assignment }));
    return { success: true, assignment: data.assignment };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setAssignmentsError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setAssignmentsLoading({ departmentId, loading: false }));
  }
};

export const unassignDeptRole = (departmentId, payload) => async (dispatch) => {
  dispatch(setAssignmentsLoading({ departmentId, loading: true }));
  try {
    const { data } = await api.post(`/departments/${departmentId}/roles/unassign`, payload);
    dispatch(upsertAssignmentLocal({ departmentId, assignment: data.assignment }));
    return { success: true, assignment: data.assignment };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    dispatch(setAssignmentsError({ departmentId, error: error?.response?.data?.message }));
    return { success: false };
  } finally {
    dispatch(setAssignmentsLoading({ departmentId, loading: false }));
  }
};