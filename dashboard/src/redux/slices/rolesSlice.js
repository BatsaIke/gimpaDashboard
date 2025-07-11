// src/redux/slices/rolesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    setRolesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRolesError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setRoles, setRolesLoading, setRolesError } = rolesSlice.actions;
export default rolesSlice.reducer;
