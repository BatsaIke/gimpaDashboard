import React, { useMemo, useState, useCallback } from "react";
import styles from "./AddDeptRoleModal.module.css";
import Modal from "../../../UI/modal/Modal";

/**
 * Props
 * - isOpen, onClose                : modal visibility controls
 * - departments: Dept[]            : [{ _id, name, category }]
 * - departmentId, setDepartmentId  : controlled select
 * - roleName, setRoleName          : controlled input
 * - roleDesc, setRoleDesc          : controlled textarea
 * - onSave()                       : parent handler (should dispatch createDeptRole)
 * - saving?: boolean               : disables Save + shows spinner text
 */
const AddDeptRoleModal = ({
  isOpen,
  onClose,
  departments = [],
  departmentId,
  setDepartmentId,
  roleName,
  setRoleName,
  roleDesc,
  setRoleDesc,
  onSave,
  saving = false,
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return departments
      .slice()
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
      .filter((d) => {
        const n = String(d.name || "").toLowerCase();
        const c = String(d.category || "").toLowerCase();
        return !q || n.includes(q) || c.includes(q);
      });
  }, [departments, search]);

  const canSave = Boolean(departmentId) && roleName.trim().length > 0;

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (!canSave || saving) return;
      onSave(); // parent reads current controlled state and dispatches API call
    },
    [canSave, saving, onSave]
  );

  const handleClose = useCallback(() => {
    if (saving) return; // prevent closing while saving
    onClose();
  }, [onClose, saving]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header="Add Role (Department Level)"
      footer={
        <div className={styles.footerRow}>
          <button
            onClick={handleClose}
            className={styles.cancelButton}
            type="button"
            disabled={saving}
            aria-disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={styles.saveButton}
            type="button"
            disabled={!canSave || saving}
            aria-disabled={!canSave || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      {/* Dark card so content is visible even if the Modal shell is white */}
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.modalFormLike}>
          <label className={styles.label}>Department</label>
          <input
            className={styles.searchInput}
            placeholder="Search department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={saving}
          />
          <select
            className={styles.filterSelect}
            value={departmentId || ""}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={saving}
          >
            <option value="">— choose department —</option>
            {filtered.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} {d.category ? `(${d.category})` : ""}
              </option>
            ))}
          </select>

          <label className={styles.label}>Role name</label>
          <input
            className={styles.searchInput}
            placeholder="e.g. Exams Officer"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            maxLength={120}
            disabled={saving}
          />

          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textareaLike}
            placeholder="Short role description (optional)"
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
            maxLength={600}
            disabled={saving}
          />

          {/* inline validation */}
          {!departmentId || roleName.trim().length === 0 ? (
            <div className={styles.hint}>
              Select a department and enter a role name to enable Save.
            </div>
          ) : null}
        </div>

        {/* Submit on Enter without clicking footer button */}
        <button type="submit" className={styles.hiddenSubmit} disabled={!canSave || saving} />
      </form>
    </Modal>
  );
};

export default AddDeptRoleModal;
