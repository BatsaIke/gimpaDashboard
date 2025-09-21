import React, { useMemo, useState } from "react";
import styles from "./ModalForm.module.css";
import Modal from "../../UI/modal/Modal";

const AddDepartmentModal = ({
  isOpen,
  onClose,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  onSave,
  isTop = false,          // Top-level: create root departments; no parent selection
  parentId,
  setParentId,
  allowedParents = [],    // Only used when isTop === false
}) => {
  // Local search for the Parent dropdown (dept level only)
  const [parentSearch, setParentSearch] = useState("");

  // Sort + filter parents by search text
  const filteredParents = useMemo(() => {
    const list = Array.isArray(allowedParents) ? [...allowedParents] : [];
    list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    if (!parentSearch.trim()) return list;
    const q = parentSearch.toLowerCase();
    return list.filter(
      (p) =>
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q)
    );
  }, [allowedParents, parentSearch]);

  // Group by category (nice when you have Faculty / Unit mix)
  const groups = useMemo(() => {
    const byCat = new Map();
    for (const p of filteredParents) {
      const cat = p.category || "Other";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(p);
    }
    return byCat;
  }, [filteredParents]);

  // Valid when name present; parent required only at department level
  const formValid = name.trim().length > 0 && (isTop || (parentId && String(parentId).length));

  const handleSave = () => {
    if (!formValid) return;
    onSave(); // parent requirement already enforced by disabled button
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={isTop ? "Add Faculty / Unit" : "Add Sub-Department"}
      footer={
        <div className={styles.footerRow}>
          <button onClick={onClose} className={styles.cancelButton} type="button">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            type="button"
            disabled={!formValid}
            aria-disabled={!formValid}
            title={!formValid ? "Enter a name and (if required) select a parent" : "Save"}
          >
            Save
          </button>
        </div>
      }
      contentClassName={styles.modalContent}
    >
      <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formHeader}>
          <h4 className={styles.formTitle}>
            {isTop ? "Create root department" : "Create sub-department"}
          </h4>
          <p className={styles.formSubtitle}>
            {isTop
              ? "Root departments do not require a parent."
              : "Choose a parent department you supervise."}
          </p>
        </div>

        <label htmlFor="deptName" className={styles.label}>Name</label>
        <input
          id="deptName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
          placeholder="e.g., GIMPA Business School (GBS)"
          autoFocus
        />

        <label htmlFor="deptDesc" className={styles.label}>Description</label>
        <textarea
          id="deptDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="What does this department focus on?"
        />

        <label htmlFor="deptCategory" className={styles.label}>Category</label>
        <select
          id="deptCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          <option value="Faculty">Faculty</option>
          <option value="Unit">Unit</option>
        </select>

        {/* Parent is HIDDEN for top level (roots only) */}
        {!isTop && (
          <>
            <label htmlFor="deptParent" className={styles.label}>
              Parent <span className={styles.requiredMark}>*</span>
            </label>

            {/* Parent search (helps with long lists) */}
            <input
              type="text"
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              className={styles.input}
              placeholder="Search parent by name or category…"
              aria-label="Search parents"
            />

            {filteredParents.length === 0 ? (
              <div className={styles.emptyParentHint}>
                No selectable parents in your scope.
              </div>
            ) : (
              <select
                id="deptParent"
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value || "")}
                className={styles.select}
                required
              >
                <option value="">— Select parent —</option>
                {[...groups.keys()].map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {groups.get(cat).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddDepartmentModal;
