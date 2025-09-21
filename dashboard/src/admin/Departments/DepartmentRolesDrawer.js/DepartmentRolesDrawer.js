// src/admin/Departments/DepartmentRolesDrawer/DepartmentRolesDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./DepartmentRolesDrawer.module.css";
import {
  createDeptRole,
  deleteDeptRole,
  fetchDeptRoles,
  updateDeptRole,
} from "../../../actions/departmentRolesActions";

function toArray(maybe) {
  if (Array.isArray(maybe)) return maybe;
  if (Array.isArray(maybe?.data)) return maybe.data;
  if (Array.isArray(maybe?.roles)) return maybe.roles;
  return [];
}

const DepartmentRolesDrawer = ({ open, onClose, department, canManage = true }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]); // may briefly hold non-array; we’ll normalize

  // form
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reportsTo, setReportsTo] = useState("");

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setReportsTo("");
  };

  const load = async () => {
    if (!department?._id) return;
    setLoading(true);
    const res = await dispatch(fetchDeptRoles(department._id));
    // 👇 normalize whatever came back into a flat array
    setRoles(toArray(res?.data));
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department?._id]);

  // Always use this normalized list in render
  const safeRoles = useMemo(() => toArray(roles), [roles]);

  const onSubmit = async () => {
    if (!name.trim() || !department?._id) return;

    if (editing) {
      const res = await dispatch(
        updateDeptRole(
          department._id,
          editing._id,
          { name, description, reportsTo: reportsTo || null }
        )
      );
      if (res?.success) { await load(); resetForm(); }
      return;
    }

    const res = await dispatch(
      createDeptRole(
        department._id,
        { name, description, reportsTo: reportsTo || null }
      )
    );
    if (res?.success) { await load(); resetForm(); }
  };

  const onEdit = (role) => {
    setEditing(role);
    setName(role?.name || "");
    setDescription(role?.description || "");
    setReportsTo(role?.reportsTo ? (role.reportsTo._id || role.reportsTo) : "");
  };

  const onDeleteClick = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    const res = await dispatch(deleteDeptRole(department._id, role._id));
    if (res?.success) {
      await load();
      if (editing?._id === role._id) resetForm();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Manage Roles — {department?.name}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.listCol}>
            {loading ? (
              <div className={styles.loading}>Loading…</div>
            ) : safeRoles.length === 0 ? (
              <div className={styles.empty}>No roles yet. Create one on the right.</div>
            ) : (
              <ul className={styles.roleList}>
                {safeRoles.map((r) => (
                  <li key={r._id} className={styles.roleItem}>
                    <div>
                      <div className={styles.roleName}>{r.name}</div>
                      {r.reportsTo && (
                        <div className={styles.roleMeta}>
                          Reports to: {r.reportsTo?.name || "—"}
                        </div>
                      )}
                      {r.description && (
                        <div className={styles.roleDesc}>{r.description}</div>
                      )}
                    </div>
                    {canManage && (
                      <div className={styles.rowActions}>
                        <button className={styles.secondary} onClick={() => onEdit(r)}>Edit</button>
                        <button className={styles.danger} onClick={() => onDeleteClick(r)}>Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.formCol}>
            <div className={styles.formCard} aria-disabled={!canManage}>
              <h4>{editing ? "Edit Role" : "Add Role"}</h4>

              <label>Name</label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Exams Officer"
                disabled={!canManage}
              />

              <label>Description</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this role do?"
                disabled={!canManage}
              />

              <label>Reports To (optional)</label>
              <select
                className={styles.select}
                value={reportsTo}
                onChange={(e) => setReportsTo(e.target.value)}
                disabled={!canManage}
              >
                <option value="">— None —</option>
                {safeRoles.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>

              <div className={styles.formRow}>
                {editing && (
                  <button type="button" className={styles.ghost} onClick={resetForm} disabled={!canManage}>
                    Cancel edit
                  </button>
                )}
                <button
                  type="button"
                  className={styles.primary}
                  onClick={onSubmit}
                  disabled={!canManage || !name.trim()}
                >
                  {editing ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </div>

            <p className={styles.helpText}>
              * Only Top roles or department supervisors can manage roles here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentRolesDrawer;
