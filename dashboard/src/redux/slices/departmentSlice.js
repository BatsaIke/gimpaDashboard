import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // List of departments
  loading: false, // Indicates if an API call is in progress
  error: null, // Stores any error messages
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    // Fetch departments
    setDepartments: (state, action) => {
      state.items = action.payload;
    },

    // Add a department
    addDepartment: (state, action) => {
      const newDepartment = action.payload;
      state.items.push(newDepartment);
    },

    // Update a department
    updateDepartment: (state, action) => {
      const updatedDepartment = action.payload;
      const index = state.items.findIndex((item) => item._id === updatedDepartment._id);
      if (index !== -1) {
        state.items[index] = updatedDepartment;
      }
    },

    // Delete a department
    deleteDepartment: (state, action) => {
      const idToDelete = action.payload;
      state.items = state.items.filter((item) => item._id !== idToDelete);
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  setLoading,
  setError,
} = departmentSlice.actions;

export default departmentSlice.reducer;
