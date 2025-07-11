import api from '../api';
import {
  setLoading,
  setError,
  setToken,
  setRefreshToken as setReduxRefreshToken,
  setUser,
  setRole,
  logout as logoutAction,
  setUsers
} from '../redux/slices/authSlice';
import { setRoles, setRolesError, setRolesLoading } from '../redux/slices/rolesSlice';
import apiErrorHandler from '../utils/apiHandleError';
import {
  setAuthToken,
  setRefreshToken,
  clearTokens,
  getRefreshToken
} from '../utils/setAuthToken';
 import { jwtDecode } from 'jwt-decode';
import { set_Alert } from './alertAction';

/* ------------------------------------------------------------------ */
/* SUPER-ADMIN ➜  POST /auth/users                                     */
/* ------------------------------------------------------------------ */

// actions/authAction.js
export const signupSuperAdmin = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.post('/auth/signup/super-admin', data);          // ← new route
    return { success: true };
  } catch (err) {
    /* do NOT dispatch logoutAction() for this call */
    apiErrorHandler(dispatch, err, { suppressLogout: true });
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};



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
    const { token, refreshToken, role } = data;

    // tokens → redux + storage
    dispatch(setToken(token));
    dispatch(setReduxRefreshToken(refreshToken));
    setAuthToken(token);
    setRefreshToken(refreshToken);
    if (role) dispatch(setRole(role));

    // immediately pull full profile
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
    const { token, refreshToken } = data;

    dispatch(setToken(token));
    dispatch(setReduxRefreshToken(refreshToken));
    setAuthToken(token);
    setRefreshToken(refreshToken);

    // update cached profile
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
/* ------------------------------------------------------------------ */
export const fetchMyProfile = (tokenFromArg) => async (dispatch, getState) => {
  const token = tokenFromArg || getState().auth.token;
  if (!token) return { success: false };

  const { id } = jwtDecode(token);          // { id, role, … }
  if (!id) return { success: false };

  dispatch(setLoading(true));
  try {
    const { data } = await api.get(`/auth/users/${id}`);
    dispatch(setUser(data));
    if (data.role) dispatch(setRole(data.role));
    return { success: true };
  } catch (err) {
    apiErrorHandler(dispatch, err);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateUser = (id, updateData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.patch(`/auth/users/${id}`, updateData);
    dispatch(setUser(data.user)); // optional: update local user state
    return { success: true, user: data.user };
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
};


export const fetchRoles = () => async (dispatch) => {
  dispatch(setRolesLoading(true));
  try {
    const { data } = await api.get("/roles/roles"); // adjust this endpoint if needed!
    dispatch(setRoles(data));
    return { success: true, data };
  } catch (err) {
    dispatch(setRolesError(err.message || "Failed to fetch roles"));
    return { success: false };
  } finally {
    dispatch(setRolesLoading(false));
  }
};

export const fetchEmployees = () => async (dispatch) => {
  
  dispatch(setLoading(true));           // if you have a loading flag
  try {
    // hit the unified users list
    const { data } = await api.get('/auth/users');
    dispatch(setUsers(data));
    return { success: true, data };     // data is your array of user-objects
  } catch (err) {
    dispatch(set_Alert(err.message || 'Failed to fetch users', 'error'));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};


/**
 * DELETE ➜ /auth/users/:id
 */
export const deleteUser = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/auth/users/${id}`);
    dispatch(set_Alert('User deleted successfully', 'success'));
    return { success: true };
  } catch (err) {
    dispatch(
      set_Alert(
        err.response?.data?.message || 'Failed to delete user',
        'error'
      )
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * POST ➜ /auth/users/:id/reset-password
 */
export const resetUserPassword = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await api.post(`/auth/users/${id}/reset-password`);
    dispatch(
      set_Alert(
        data.message || 'Password reset successfully',
        'success'
      )
    );
    return { success: true, message: data.message };
  } catch (err) {
    dispatch(
      set_Alert(
        err.response?.data?.message || 'Failed to reset password',
        'error'
      )
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};
