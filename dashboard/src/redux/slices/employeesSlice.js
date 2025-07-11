// src/redux/slices/employeesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  roles: [], // Added roles array
  loading: false,
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.items = action.payload;
    },
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    addEmployee: (state, action) => {
      state.items.push(action.payload);
    },
    updateEmployee: (state, action) => {
      const index = state.items.findIndex(emp => emp._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeEmployee: (state, action) => {
      state.items = state.items.filter(emp => emp._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setEmployees, 
  setRoles,
  addEmployee, 
  updateEmployee, 
  removeEmployee, 
  setLoading, 
  setError 
} = employeesSlice.actions;

export default employeesSlice.reducer;