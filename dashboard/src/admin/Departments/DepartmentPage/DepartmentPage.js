import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./DepartmentPage.module.css";
import {
  fetchDepartments,
  createDepartment,
  editDepartment,
  removeDepartment,
} from "../../../actions/departmentsActions";
import { set_Alert } from "../../../actions/alertAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddDepartmentModal from "../AddDepartmentModal";
import EditDepartmentModal from "../EditDepartmentModal";
import DepartmentList from "../DepartmentList";

const DepartmentPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.departments);

  /* ───────────────────── Local state ───────────────────── */
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Faculty");
  const [editingDept, setEditingDept] = useState(null);

  /* ─────────────────── Fetch on mount ─────────────────── */
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  /* ──────────────────── Open modals ───────────────────── */
  const openAdd = () => {
    setName("");
    setDescription("");
    setCategory("Faculty");
    setAddOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setCategory(dept.category || "Faculty");
    setEditOpen(true);
  };

  /* ───────────────────  CRUD handlers ─────────────────── */
  const doAdd = async () => {
    if (!name.trim()) {
      return dispatch(set_Alert("Name cannot be empty", "error"));
    }
    const res = await dispatch(
      createDepartment({ name, description, category })
    );
    if (res.success) {
      dispatch(set_Alert("Department added", "success"));
      setAddOpen(false);
    } else {
      dispatch(set_Alert(res.message || "Add failed", "error"));
    }
  };

  const doEdit = async () => {
    if (!editingDept) return;
    const res = await dispatch(
      editDepartment({
        id: editingDept._id,
        name,
        description,
        category,
      })
    );
    if (res.success) {
      dispatch(set_Alert("Department updated", "success"));
      setEditOpen(false);
    } else {
      dispatch(set_Alert(res.message || "Update failed", "error"));
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    const res = await dispatch(removeDepartment(id));
    if (res.success) {
      dispatch(set_Alert("Department deleted", "success"));
    } else {
      dispatch(set_Alert(res.message || "Delete failed", "error"));
    }
  };

  /* ─────────────────────── UI ─────────────────────── */
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Faculties &amp; Units</h1>
        <button onClick={openAdd} className={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Add Faculty/Unit
        </button>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading departments...</p>
        </div>
      )}
      
      {error && <div className={styles.errorState}>{error}</div>}

      {!loading && !error && items.length === 0 ? (
        <div className={styles.emptyState}>
          <img src="/images/empty-departments.svg" alt="No departments" />
          <h3>No Departments Found</h3>
          <p>Add your first department to get started</p>
        </div>
      ) : (
        <DepartmentList
          departments={items}
          onEdit={openEdit}
          onDelete={doDelete}
        />
      )}

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        onSave={doAdd}
      />

      <EditDepartmentModal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        onSave={doEdit}
      />
    </div>
  );
};

export default DepartmentPage;