// src/admin/rector/RectorLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RectorSidebar from "./RectorSidebar";

import DepartmentPage from "../Departments/DepartmentPage/DepartmentPage";
import EmployeesPage from "../Employees/EmployeesPage/EmployeesPage";
// etc

const RectorLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <RectorSidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="users" element={<EmployeesPage />} />
          <Route path="*" element={<Navigate to="home" />} />
        </Routes>
      </div>
    </div>
  );
};

export default RectorLayout;
