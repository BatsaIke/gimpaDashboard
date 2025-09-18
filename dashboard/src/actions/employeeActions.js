// src/redux/actions/employeesActions.js

import api from "../api";
import { setRole, setToken, setUser } from "../redux/slices/authSlice";
import { setEmployees, setLoading, setRoles } from "../redux/slices/employeesSlice";
import apiErrorHandler from "../utils/apiHandleError";


// Fetch all employees
export const fetchEmployees = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/employees");
    dispatch(setEmployees(response.data));
    return { success: true, data: response.data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch all available roles
export const fetchRoles = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get("/roles/roles");
    dispatch(setRoles(response.data.data)); // Make sure to use response.data.data
    return { 
      success: true, 
      roles: response.data.data 
    };
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// Create new employee with role validation
export const createEmployee = (employeeData) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    // Get current user's role from Redux state
    
    // Optional: Frontend validation of role assignment
    // Backend will also validate this
    const response = await api.post("/employees", employeeData);
    
    // Refresh employees list after creation
    dispatch(fetchEmployees());
    
    return { 
      success: true, 
      employee: response.data.user 
    };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// Update existing employee
export const updateEmployee = (id, employeeData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.patch(`/employees/${id}`, employeeData);
    // Refresh employees list after update
    dispatch(fetchEmployees());
    return { success: true, employee: response.data.user };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// Other actions (getEmployeeById, removeEmployee, resetEmployeePassword, etc.)
// ... keep the existing implementations ...
/**
 * 3) GET /users/:id (Get Employee By ID)
 */
export const getEmployeeById = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/employees/${id}`);
    return { success: true, employee: response.data };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};



/**
 * 5) DELETE /users/:id (Remove Employee)
 */
export const removeEmployee = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await api.delete(`/employees/${id}`);
    return { success: true };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 6) POST /users/:id/reset-password (Reset Employee Password to "123456")
 */
export const resetEmployeePassword = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post(`/employees/${id}/reset-password`);
    return { success: true, message: response.data.message };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * 7) POST /users/login (Employee Login)
 * 
 * The backend expects { text, password } 
 * text can be phone or email
 */
export const employeeLogin = (credentials) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post("/employees/login", credentials);
    const { token, employee } = response.data;

    console.log("API Login Response:", response.data); // ✅ Debugging

    if (!employee || !employee.role) {
      console.error("Error: Employee role is missing in response!");
      return { success: false };
    }

    dispatch(setToken(token));        // sets auth.token + localStorage
    dispatch(setUser(employee));      // sets auth.user
    dispatch(setRole(employee.role)); // ✅ Sets role correctly

    return { success: true, employee }; // ✅ Returns correct structure
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};


/**
 * 8) POST /users/:id/change-password (Employee Change Password)
 * 
 * Usually expects { oldPassword, newPassword }
 */
export const changeEmployeePassword = (id, payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.post(`/employees/${id}/change-password`, payload);
    // Suppose the server returns { message: "Password changed successfully" }
    return { success: true, message: response.data.message };
  } catch (error) {
    apiErrorHandler(dispatch, error);
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};


