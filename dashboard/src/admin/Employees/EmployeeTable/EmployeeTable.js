// src/components/EmployeeTable/EmployeeTable.jsx
import React from "react";
import styles from "./EmployeeTable.module.css";
import EmployeeCard from "./EmployeeCard";

const EmployeeTable = ({ 
  employees, 
  onEdit, 
  onDelete, 
  onResetPassword, 
  onView 
}) => {
  return (
    <div className={styles.container}>
      {employees.length === 0 ? (
        <div className={styles.emptyState}>
          <img src="/images/empty-employees.svg" alt="No employees" />
          <h3>No Employees Found</h3>
          <p>Add your first employee to get started</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {employees.map(employee => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
              onResetPassword={onResetPassword}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;