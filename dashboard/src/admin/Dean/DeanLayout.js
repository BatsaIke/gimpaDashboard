// src/admin/dean/DeanLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DeanSidebar from "./DeanSidebar";

import DeanHomePage from "./pages/DeanHomePage.js";
import DeanKPIsPage from "./pages/DeanKPIsPage";
// Add or import other Dean pages as needed

const DeanLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <DeanSidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          <Route path="home" element={<DeanHomePage />} />
          <Route path="kpis" element={<DeanKPIsPage />} />
          {/* etc. Add more routes for Dean */}
          <Route path="*" element={<Navigate to="home" />} />
        </Routes>
      </div>
    </div>
  );
};

export default DeanLayout;
