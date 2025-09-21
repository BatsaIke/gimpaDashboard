// src/redux/slices/departmentRolesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // rolesByDept: { [departmentId]: { items: [], loading: false, error: null, lastLoadedAt: number|null } }
  rolesByDept: {},
  // assignmentsByDept: { [departmentId]: { items: [], loading: false, error: null } } (optional aggregation)
  assignmentsByDept: {},
};

const ensureDeptBucket = (state, deptId) => {
  if (!state.rolesByDept[deptId]) {
    state.rolesByDept[deptId] = { items: [], loading: false, error: null, lastLoadedAt: null };
  }
  if (!state.assignmentsByDept[deptId]) {
    state.assignmentsByDept[deptId] = { items: [], loading: false, error: null };
  }
};

const departmentRolesSlice = createSlice({
  name: "departmentRoles",
  initialState,
  reducers: {
    // ---- Roles list / load
    setDeptRolesLoading: (state, { payload: { departmentId, loading } }) => {
      ensureDeptBucket(state, departmentId);
      state.rolesByDept[departmentId].loading = loading;
      if (loading) state.rolesByDept[departmentId].error = null;
    },
    setDeptRolesError: (state, { payload: { departmentId, error } }) => {
      ensureDeptBucket(state, departmentId);
      state.rolesByDept[departmentId].error = error || "Failed to load department roles";
      state.rolesByDept[departmentId].loading = false;
    },
    setDeptRoles: (state, { payload: { departmentId, roles } }) => {
      ensureDeptBucket(state, departmentId);
      state.rolesByDept[departmentId].items = roles || [];
      state.rolesByDept[departmentId].loading = false;
      state.rolesByDept[departmentId].error = null;
      state.rolesByDept[departmentId].lastLoadedAt = Date.now();
    },

    // ---- Role CRUD
    addDeptRole: (state, { payload: { departmentId, role } }) => {
      ensureDeptBucket(state, departmentId);
      state.rolesByDept[departmentId].items.push(role);
    },
    updateDeptRoleLocal: (state, { payload: { departmentId, role } }) => {
      ensureDeptBucket(state, departmentId);
      const arr = state.rolesByDept[departmentId].items;
      const i = arr.findIndex((r) => r._id === role._id);
      if (i !== -1) arr[i] = role;
    },
    deleteDeptRoleLocal: (state, { payload: { departmentId, roleId } }) => {
      ensureDeptBucket(state, departmentId);
      const arr = state.rolesByDept[departmentId].items;
      state.rolesByDept[departmentId].items = arr.filter((r) => r._id !== roleId);
    },

    // ---- Assignments (optional: handy if you show a grid)
    setAssignmentsLoading: (state, { payload: { departmentId, loading } }) => {
      ensureDeptBucket(state, departmentId);
      state.assignmentsByDept[departmentId].loading = loading;
      if (loading) state.assignmentsByDept[departmentId].error = null;
    },
    setAssignmentsError: (state, { payload: { departmentId, error } }) => {
      ensureDeptBucket(state, departmentId);
      state.assignmentsByDept[departmentId].error = error || "Failed to load assignments";
      state.assignmentsByDept[departmentId].loading = false;
    },
    setAssignments: (state, { payload: { departmentId, items } }) => {
      ensureDeptBucket(state, departmentId);
      state.assignmentsByDept[departmentId].items = items || [];
      state.assignmentsByDept[departmentId].loading = false;
      state.assignmentsByDept[departmentId].error = null;
    },
    upsertAssignmentLocal: (state, { payload: { departmentId, assignment } }) => {
      ensureDeptBucket(state, departmentId);
      const arr = state.assignmentsByDept[departmentId].items;
      const i = arr.findIndex(
        (a) => a._id === assignment._id || (String(a.user) === String(assignment.user) && String(a.role) === String(assignment.role))
      );
      if (i !== -1) arr[i] = assignment;
      else arr.push(assignment);
    },
    deactivateAssignmentLocal: (state, { payload: { departmentId, assignmentId } }) => {
      ensureDeptBucket(state, departmentId);
      const arr = state.assignmentsByDept[departmentId].items;
      const i = arr.findIndex((a) => a._id === assignmentId);
      if (i !== -1) arr[i] = { ...arr[i], isActive: false };
    },
  },
});

export const {
  setDeptRolesLoading,
  setDeptRolesError,
  setDeptRoles,
  addDeptRole,
  updateDeptRoleLocal,
  deleteDeptRoleLocal,
  setAssignmentsLoading,
  setAssignmentsError,
  setAssignments,
  upsertAssignmentLocal,
  deactivateAssignmentLocal,
} = departmentRolesSlice.actions;

export default departmentRolesSlice.reducer;

// -------- Selectors
export const selectDeptRoles = (state, departmentId) =>
  state.departmentRoles?.rolesByDept?.[departmentId]?.items || [];

export const selectDeptRolesLoading = (state, departmentId) =>
  !!state.departmentRoles?.rolesByDept?.[departmentId]?.loading;

export const selectDeptRolesError = (state, departmentId) =>
  state.departmentRoles?.rolesByDept?.[departmentId]?.error || null;

export const selectAssignments = (state, departmentId) =>
  state.departmentRoles?.assignmentsByDept?.[departmentId]?.items || [];

export const selectAssignmentsLoading = (state, departmentId) =>
  !!state.departmentRoles?.assignmentsByDept?.[departmentId]?.loading;

export const selectAssignmentsError = (state, departmentId) =>
  state.departmentRoles?.assignmentsByDept?.[departmentId]?.error || null;
