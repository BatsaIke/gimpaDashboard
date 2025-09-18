// src/actions/authAction.js
import api from '../api';
import {
  setLoading,
  setToken,
  setRefreshToken as setReduxRefreshToken,
  setUser,
  setRole,
  logout as logoutAction,
  setUsers,
} from '../redux/slices/authSlice';
import {
  setRoles,
  setRolesError,
  setRolesLoading,
} from '../redux/slices/rolesSlice';
import apiErrorHandler from '../utils/apiHandleError';
import {
  setAuthToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken,
} from '../utils/setAuthToken';
import { jwtDecode } from 'jwt-decode';
import { set_Alert } from './alertAction';

/* ------------------------------------------------------------------ */
/* SUPER-ADMIN ➜  POST /auth/signup/super-admin                        */
/* ------------------------------------------------------------------ */
export const signupSuperAdmin = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.post('/auth/signup/super-admin', data);
    return { success: true };
  } catch (err) {
    // No forced logout on signup SA errors
    apiErrorHandler(dispatch, err, { suppressLogout: true });
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* CREATE USER ➜  POST /auth/users                                     */
/* ------------------------------------------------------------------ */
export const createUser = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.post('/auth/users', data);
    return { success: true, message: 'User created' };
  } catch (err) {
    apiErrorHandler(dispatch, err);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* LOGIN ➜  POST /auth/login                                           */
/* ------------------------------------------------------------------ */
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.post('/auth/login', credentials);
    const { token, refreshToken, role } = data || {};

    if (!token || !refreshToken) throw new Error('Missing tokens');

    // Persist tokens to Redux + storage
    dispatch(setToken(token));
    dispatch(setReduxRefreshToken(refreshToken));
    setAuthToken(token);
    setRefreshToken(refreshToken);

    // Store role if backend included it (not required)
    if (role) dispatch(setRole(role));

    // Immediately pull full profile into Redux
    await dispatch(fetchMyProfile(token));

    return { success: true };
  } catch (err) {
    apiErrorHandler(dispatch, err);
    clearTokens();
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* REFRESH ➜  POST /auth/refresh                                       */
/* ------------------------------------------------------------------ */
export const refreshTokens = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const oldRT = getRefreshToken();
    if (!oldRT) throw new Error('No refresh token');

    const { data } = await api.post('/auth/refresh', { refreshToken: oldRT });
    const { token, refreshToken } = data || {};
    if (!token || !refreshToken) throw new Error('Missing tokens');

    dispatch(setToken(token));
    dispatch(setReduxRefreshToken(refreshToken));
    setAuthToken(token);
    setRefreshToken(refreshToken);

    // Keep user profile fresh
    await dispatch(fetchMyProfile(token));

    return { success: true };
  } catch (err) {
    apiErrorHandler(dispatch, err);
    dispatch(logoutAction());
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* PROFILE ➜  GET /auth/users/:id                                      */
/* (No /auth/me endpoint needed; decode JWT → id → fetch user)         */
/* ------------------------------------------------------------------ */
// src/actions/authAction.js
export const fetchMyProfile = (tokenFromArg) => async (dispatch, getState) => {
  const token = tokenFromArg || getState()?.auth?.token;
  if (!token) return { success: false };

  dispatch(setLoading(true));
  try {
    // 1) Preferred: enriched profile
    const me = await api.get(`/auth/me`);
    dispatch(setUser(me.data));            // includes headOf, supervisorOf, headSubtree
    if (me?.data?.role) dispatch(setRole(me.data.role));
    return { success: true, data: me.data };
  } catch (errMe) {
    // 2) Fallback for legacy backends without /auth/me
    let subId = null;
    try {
      const decoded = jwtDecode(token);
      subId = decoded?.id || decoded?._id || decoded?.sub || null;
    } catch {/* ignore */}

    if (!subId) {
      apiErrorHandler(dispatch, errMe);
      return { success: false };
    }

    try {
      const { data } = await api.get(`/auth/users/${subId}`);
      dispatch(setUser(data));             // bare user; UI will still work but w/o enriched arrays
      if (data?.role) dispatch(setRole(data.role));
      return { success: true, data };
    } catch (errUser) {
      apiErrorHandler(dispatch, errUser);
      return { success: false };
    }
  } finally {
    dispatch(setLoading(false));
  }
};


/* ------------------------------------------------------------------ */
/* UPDATE USER ➜ PATCH /auth/users/:id                                 */
/* ------------------------------------------------------------------ */
export const updateUser = (id, updateData) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.patch(`/auth/users/${id}`, updateData);
    const currentId = getState()?.auth?.user?._id;

    if (String(id) === String(currentId)) {
      // refresh enriched profile
      await dispatch(fetchMyProfile());
    } else if (data?.user) {
      // if it’s not me, keep optimistic update for lists, etc.
      // (optional) dispatch(setUser(data.user)) only if you’re editing the viewed profile
    }

    return { success: true, user: data?.user };
  } catch (err) {
    apiErrorHandler(dispatch, err);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* LOGOUT                                                              */
/* ------------------------------------------------------------------ */
export const logout = () => (dispatch) => {
  clearTokens();
  dispatch(logoutAction());
  return { success: true };
};

/* ------------------------------------------------------------------ */
/* ME (cached)                                                         */
/* Uses redux if user already loaded; otherwise fetchMyProfile()       */
/* ------------------------------------------------------------------ */
export const fetchMe = () => async (dispatch, getState) => {
  const cached = getState()?.auth?.user;
  if (cached && cached._id) return { success: true, data: cached };

  const res = await dispatch(fetchMyProfile());
  if (res?.success) {
    const user = getState()?.auth?.user;
    return { success: true, data: user };
  }
  return { success: false };
};

/* ------------------------------------------------------------------ */
/* ROLES ACCESSIBLE TO CALLER ➜ GET /roles/accessible                  */
/* Expect: { success: true, data: string[] }                           */
/* ------------------------------------------------------------------ */
export const fetchAllowedTargetRoles = () => async () => {
  try {
    const { data } = await api.get('/roles/accessible');
    return { success: !!data?.success, data: data?.data || [] };
  } catch {
    return { success: false, data: [] };
  }
};

/* ------------------------------------------------------------------ */
/* ALL ROLES FOR PICKERS ➜ GET /roles/roles                            */
/* Adjust path to your backend if different                            */
/* ------------------------------------------------------------------ */
export const fetchRoles = () => async (dispatch) => {
  dispatch(setRolesLoading(true));
  try {
    const { data } = await api.get('/roles/roles');
    dispatch(setRoles(data));
    return { success: true, data };
  } catch (err) {
    dispatch(setRolesError(err?.message || 'Failed to fetch roles'));
    return { success: false };
  } finally {
    dispatch(setRolesLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* USERS LIST ➜ GET /auth/users                                        */
/* ------------------------------------------------------------------ */
export const fetchEmployees = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.get('/auth/users');
    dispatch(setUsers(data));
    return { success: true, data };
  } catch (err) {
    dispatch(set_Alert(err?.message || 'Failed to fetch users', 'error'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* DELETE ➜ /auth/users/:id                                            */
/* ------------------------------------------------------------------ */
export const deleteUser = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/auth/users/${id}`);
    dispatch(set_Alert('User deleted successfully', 'success'));
    return { success: true };
  } catch (err) {
    dispatch(set_Alert(err.response?.data?.message || 'Failed to delete user', 'error'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/* ------------------------------------------------------------------ */
/* RESET PASSWORD ➜ POST /auth/users/:id/reset-password                */
/* ------------------------------------------------------------------ */
export const resetUserPassword = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.post(`/auth/users/${id}/reset-password`);
    dispatch(set_Alert(data?.message || 'Password reset successfully', 'success'));
    return { success: true, message: data?.message };
  } catch (err) {
    dispatch(set_Alert(err.response?.data?.message || 'Failed to reset password', 'error'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};
