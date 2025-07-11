import React from "react";
import styles from "./KpiMainFields.module.css";
import { FaBuilding, FaHeading, FaAlignLeft } from "react-icons/fa";

const KpiMainFields = ({ newKpi, setNewKpi, departments, errors }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewKpi((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setNewKpi((prev) => ({
      ...prev,
      departments: e.target.checked
        ? [...prev.departments, deptId]
        : prev.departments.filter((id) => id !== deptId),
    }));
  };

  return (
    <div className={styles.container}>
      {/* KPI Name Field */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <FaHeading className={styles.fieldIcon} />
          <label htmlFor="kpi-name">KPI Name</label>
        </div>
        <input
          id="kpi-name"
          type="text"
          name="name"
          value={newKpi.name}
          onChange={handleInputChange}
          className={`${styles.input} ${errors?.name ? styles.error : ''}`}
          placeholder="Enter KPI name"
          required
        />
        {errors?.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      {/* Description Field */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <FaAlignLeft className={styles.fieldIcon} />
          <label htmlFor="kpi-description">Description</label>
        </div>
        <textarea
          id="kpi-description"
          name="description"
          rows={4}
          value={newKpi.description}
          onChange={handleInputChange}
          className={`${styles.textarea} ${errors?.description ? styles.error : ''}`}
          placeholder="Describe the KPI objectives and expectations"
          required
        />
        {errors?.description && <span className={styles.errorMessage}>{errors.description}</span>}
      </div>

      {/* Departments Field */}
      <div className={styles.fieldGroup}>
        <div className={styles.fieldHeader}>
          <FaBuilding className={styles.fieldIcon} />
          <label>Departments</label>
          {errors?.departments && (
            <span className={styles.errorMessage}>{errors.departments}</span>
          )}
        </div>
        <div className={styles.departmentsContainer}>
          {departments.map((dept) => (
            <div key={dept._id} className={styles.checkboxItem}>
              <input
                type="checkbox"
                id={`dept-${dept._id}`}
                value={dept._id}
                checked={newKpi.departments.includes(dept._id)}
                onChange={handleDepartmentChange}
                className={styles.checkbox}
              />
              <label htmlFor={`dept-${dept._id}`} className={styles.checkboxLabel}>
                {dept.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KpiMainFields;