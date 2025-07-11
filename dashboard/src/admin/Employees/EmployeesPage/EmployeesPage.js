// src/pages/EmployeesPage/EmployeesPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./EmployeesPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { fetchDepartments } from "../../../actions/departmentsActions";

import EmployeeTable from "../EmployeeTable/EmployeeTable";
import EmployeeFormModal from "../EmployeeFormModal/EmployeeFormModal";
import EmployeeDetailModal from "./EmployeeDetailModal";
import { deleteUser, fetchEmployees, resetUserPassword, } from "../../../actions/authAction";
import { set_Alert } from "../../../actions/alertAction";

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

 useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [empRes, deptRes] = await Promise.all([
          dispatch(fetchEmployees()),
          dispatch(fetchDepartments())
        ]);
        
        if (empRes.success) {
          // Add this filter line (only change)
          const filteredEmployees = empRes.data.filter(employee => employee.role !== "Super Admin");
          setEmployees(filteredEmployees);
        }
        if (deptRes.success) setDepartments(deptRes.data);
      } catch (error) {
        dispatch(set_Alert("Failed to load data", "error"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

   const refreshEmployees = async () => {
    const res = await dispatch(fetchEmployees());
    if (res.success) {
      // Add this filter line (only change)
      const filteredEmployees = res.data.filter(employee => employee.role !== "Super Admin");
      setEmployees(filteredEmployees);
    }
  };

  const handleCreate = () => {
    setCurrentEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsFormOpen(true);
  };

  const handleView = (employee) => {
    setCurrentEmployee(employee);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      const res = await dispatch(deleteUser(id));
      if (res.success) {
        dispatch(set_Alert("Employee deleted successfully", "success"));
        refreshEmployees();
      } else {
        dispatch(set_Alert("Failed to delete employee", "error"));
      }
    }
  };

  const handleResetPassword = async (id) => {
    if (window.confirm("Reset password to default?")) {
      const res = await dispatch(resetUserPassword(id));
      dispatch(set_Alert(
        res.success ? res.message : "Password reset failed",
        res.success ? "success" : "error"
      ));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Employee Management</h1>
            <button 
              onClick={handleCreate} 
              className={styles.addButton}
              aria-label="Add new employee"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Employee</span>
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Loading employees...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className={styles.emptyState}>
              <img 
                src="/images/empty-employees.svg" 
                alt="No employees found" 
                className={styles.emptyImage}
              />
              <h3>No Employees Found</h3>
              <p>Get started by adding your first employee</p>
              <button 
                onClick={handleCreate} 
                className={styles.addButton}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Employee</span>
              </button>
            </div>
          ) : (
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
              onView={handleView}
            />
          )}
        </main>
      </div>

      <EmployeeFormModal
        show={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editMode={!!currentEmployee}
        employee={currentEmployee}
        refreshEmployees={refreshEmployees}
        departments={departments}
      />

      <EmployeeDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        employee={currentEmployee}
        onEdit={() => {
          setIsDetailOpen(false);
          handleEdit(currentEmployee);
        }}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
};

export default EmployeesPage;
