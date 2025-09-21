import React from "react";

const DepartmentTabsHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setActiveTab("departments")}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #234",
          background: activeTab === "departments" ? "#0e2a3a" : "#0b1a26",
          color: "#eaf7ff",
          cursor: "pointer",
        }}
      >
        Faculties / Units
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("roles")}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #234",
          background: activeTab === "roles" ? "#0e2a3a" : "#0b1a26",
          color: "#eaf7ff",
          cursor: "pointer",
        }}
      >
        Roles
      </button>
    </div>
  );
};

export default DepartmentTabsHeader;
