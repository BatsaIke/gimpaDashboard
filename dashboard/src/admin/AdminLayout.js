// src/admin/AdminLayout.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyProfile } from "../actions/authAction";
import Sidebar from "./side-bar/Sidebar";
import { Outlet, Navigate } from "react-router-dom";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !role) {
      dispatch(fetchMyProfile());
    }
  }, [token, role, dispatch]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!role) {
    return <div>Loading user role...</div>; // ✅ Wait for role to load
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role={role} />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
