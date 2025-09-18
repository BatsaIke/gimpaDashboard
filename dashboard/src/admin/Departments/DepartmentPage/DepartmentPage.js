// src/admin/Departments/DepartmentPage/DepartmentPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./DepartmentPage.module.css";
import {
  fetchDepartments,
  fetchMyDepartments,  
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

const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

const DepartmentPage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);
  const isTop = TOP_ROLES.has(authUser?.role);
  const { items, loading, error } = useSelector((state) => state.departments);

  // local state
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Unit");
  const [parentId, setParentId] = useState(null); // NEW
  const [makeCreatorHead, setMakeCreatorHead] = useState(true); // optional toggle
  const [editingDept, setEditingDept] = useState(null);

  // Fetch departments (scoped for non-Top)
  useEffect(() => {
    const load = async () => {
    if (isTop) {
  await dispatch(fetchDepartments());
} else {
  await dispatch(fetchMyDepartments()); // ← only my scope
}
    };
    load();
  }, [dispatch, isTop]);

  // Client-side scope filter (fallback if /departments/my not used)
  const scopedItems = useMemo(() => {
    if (isTop) return items;

    const uid = String(authUser?._id || "");
    // membership can be string or array (populated or ids)
    const memberIds = Array.isArray(authUser?.department)
      ? authUser.department.map(d => String(typeof d === "object" ? d._id : d))
      : authUser?.department
      ? [String(typeof authUser.department === "object" ? authUser.department._id : authUser.department)]
      : [];

    // depts the user supervises or heads
    const supervisedIds = new Set(
      items
        .filter(d => String(d.head) === uid || (Array.isArray(d.supervisors) && d.supervisors.map(String).includes(uid)))
        .map(d => String(d._id))
    );

    const base = new Set([...memberIds, ...supervisedIds]);

    // visible = any dept in base OR with ancestor in base
    const visible = items.filter(d => {
      const idStr = String(d._id);
      if (base.has(idStr)) return true;
      const anc = Array.isArray(d.ancestors) ? d.ancestors.map(String) : [];
      return anc.some(a => base.has(a));
    });

    return visible;
  }, [items, authUser, isTop]);

  // Parents the user can create under
  const allowedParents = useMemo(() => {
    if (isTop) return items; // any parent (including none = root)
    const uid = String(authUser?._id || "");
    return scopedItems.filter(
      d => String(d.head) === uid || (Array.isArray(d.supervisors) && d.supervisors.map(String).includes(uid))
    );
  }, [isTop, items, scopedItems, authUser]);

  // open modals
  const openAdd = () => {
    setName("");
    setDescription("");
    setCategory("Unit");
    setParentId(isTop ? null : (allowedParents[0]?._id || null)); // default for non-Top
    setMakeCreatorHead(true);
    setAddOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setCategory(dept.category || "Unit");
    setEditOpen(true);
  };

  // permissions for edit/delete per-card
  const canEdit = (dept) =>
    isTop ||
    String(dept.head) === String(authUser?._id) ||
    (Array.isArray(dept.supervisors) && dept.supervisors.map(String).includes(String(authUser?._id)));

  const canDelete = (dept) => authUser?.role === "Rector"; // matches backend

  // CRUD handlers
  const doAdd = async () => {
    if (!name.trim()) return dispatch(set_Alert("Name cannot be empty", "error"));

    if (!isTop && !parentId) {
      return dispatch(set_Alert("Select a parent department", "error"));
    }

    const payload = {
      name,
      description,
      category,
      parent: parentId || null,
      // Optional: explicitly allow opt-out of making creator head
      makeCreatorHead,
    };

    const res = await dispatch(createDepartment(payload));
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
        // parent moves are allowed only if Top (or you can add a parent picker when user supervises both old and new)
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

  // UI
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Faculties &amp; Units</h1>
        <button onClick={openAdd} className={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> {isTop ? "Add Faculty/Unit" : "Add Sub-Department"}
        </button>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading departments...</p>
        </div>
      )}

      {error && <div className={styles.errorState}>{error}</div>}

      {!loading && !error && scopedItems.length === 0 ? (
        <div className={styles.emptyState}>
          <img src="/images/empty-departments.svg" alt="No departments" />
          <h3>No Departments in your scope</h3>
          <p>Use “Add Sub-Department” to create under your department.</p>
        </div>
      ) : (
        <DepartmentList
          departments={scopedItems}
          onEdit={(d) => (canEdit(d) ? openEdit(d) : null)}
          onDelete={(id) => (canDelete({}) ? doDelete(id) : null)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

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
        // NEW props
        isTop={isTop}
        parentId={parentId}
        setParentId={setParentId}
        allowedParents={allowedParents}
        makeCreatorHead={makeCreatorHead}
        setMakeCreatorHead={setMakeCreatorHead}
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
