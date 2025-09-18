// ==========================
// EmployeesPage.jsx
// ==========================
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./EmployeesPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { fetchDepartments } from "../../../actions/departmentsActions";

import EmployeeFormModal from "../EmployeeFormModal/EmployeeFormModal";
import EmployeeDetailModal from "./EmployeeDetailModal";

import {
  deleteUser,
  fetchEmployees,
  resetUserPassword,
  fetchMe,
  fetchAllowedTargetRoles,
} from "../../../actions/authAction";

import { set_Alert } from "../../../actions/alertAction";
import EmployeesGrouped from "../EmployeeTable/EmployeesGrouped";

const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

const idOf = (x) =>
  x && typeof x === "object" && x._id ? String(x._id) : x ? String(x) : "";

const EmployeesPage = () => {
  const dispatch = useDispatch();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [me, setMe] = useState(null);
  const [allowedRoles, setAllowedRoles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1) Fetch me first to decide department scope
        const meRes = await dispatch(fetchMe());
        if (meRes?.success) setMe(meRes.data);
        const isTop = meRes?.success && TOP_ROLES.has(meRes.data?.role);

        // 2) Fetch employees and (scoped) departments
        const [empRes, deptRes] = await Promise.all([
          dispatch(fetchEmployees()),
          dispatch(fetchDepartments(isTop ? "mine" : "mine")),
        ]);

        const ar = await dispatch(fetchAllowedTargetRoles()).catch(() => null);
        if (ar?.success && Array.isArray(ar.data)) {
          setAllowedRoles(ar.data);
        }

        if (empRes?.success && Array.isArray(empRes.data)) {
          // Hide Super Admin from the list
          setEmployees(empRes.data.filter((e) => e.role !== "Super Admin"));
        }

        if (deptRes?.success) setDepartments(deptRes.data);
      } catch {
        dispatch(set_Alert("Failed to load data", "error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const refreshEmployees = async () => {
    const res = await dispatch(fetchEmployees());
    if (res?.success && Array.isArray(res.data)) {
      setEmployees(res.data.filter((e) => e.role !== "Super Admin"));
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
      if (res?.success) {
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
      dispatch(
        set_Alert(
          res?.success ? res.message : "Password reset failed",
          res?.success ? "success" : "error"
        )
      );
    }
  };

  // Augment department list with any department found on employees
  const displayDepartments = useMemo(() => {
    const byId = new Map(departments.map((d) => [String(d._id), d]));

    for (const e of employees) {
      const d = e?.department;
      if (!d) continue;

      const id = String(typeof d === "object" ? d._id : d);
      if (byId.has(id)) continue;

      const name = typeof d === "object" && d.name ? d.name : id;
      const parent =
        typeof d === "object" &&
        Object.prototype.hasOwnProperty.call(d, "parent")
          ? d.parent || null
          : null;

      byId.set(id, { _id: id, name, parent });
    }

    return Array.from(byId.values());
  }, [departments, employees]);

  // Friendly department label for the header
  const deptLabel = useMemo(() => {
    if (!me?.department) return "";
    const arr = Array.isArray(me.department) ? me.department : [me.department];
    const nameOf = (d) => {
      if (!d) return "";
      if (typeof d === "object" && d.name) return d.name;
      const found = displayDepartments.find(
        (x) => String(x._id) === String(d)
      );
      return found?.name || String(d);
    };
    return arr.map(nameOf).filter(Boolean).join(", ");
  }, [me, displayDepartments]);

  // This is the current page's department context (e.g., EMSD) — used by the form
  const parentDepartmentId = useMemo(() => {
    const d = me?.department;
    if (!d) return null;
    if (Array.isArray(d)) return d.length ? idOf(d[0]) : null;
    return idOf(d);
  }, [me]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.pageTitle}>Employee Management</h1>
              {deptLabel && (
                <div className={styles.deptBadge}>
                  Department: <b>{deptLabel}</b>
                </div>
              )}
            </div>
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
              <button onClick={handleCreate} className={styles.addButton}>
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Employee</span>
              </button>
            </div>
          ) : (
            <EmployeesGrouped
              employees={employees}
              departments={displayDepartments}
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
        departments={displayDepartments}
        allowedRoles={allowedRoles}
        me={me}
        parentDepartmentId={parentDepartmentId}
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
