// src/admin/Departments/AddDepartmentModal.jsx
import React from "react";
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
  // NEW:
  isTop = false,
  parentId,
  setParentId,
  allowedParents = [],
  makeCreatorHead = true,
  setMakeCreatorHead,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    header={isTop ? "Add Faculty / Unit" : "Add Sub-Department"}
    footer={
      <>
        <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
        <button onClick={onSave} className={styles.saveButton}>Save</button>
      </>
    }
  >
    <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="deptName">Name:</label>
      <input
        id="deptName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={styles.input}
      />

      <label htmlFor="deptDesc">Description:</label>
      <textarea
        id="deptDesc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.textarea}
      />

      <label>Category:</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={styles.select}
      >
        <option value="Faculty">Faculty</option>
        <option value="Unit">Unit</option>
      </select>

      {/* Parent selection */}
      <label>Parent:</label>
      {isTop ? (
        <select
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || null)}
          className={styles.select}
        >
          <option value="">— Root (Top-4 only) —</option>
          {allowedParents.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      ) : (
        <select
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || "")}
          className={styles.select}
        >
          <option value="">— Select parent you supervise —</option>
          {allowedParents.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {/* Governance toggle: creator becomes head (your backend defaults to true) */}
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={!!makeCreatorHead}
          onChange={(e) => setMakeCreatorHead(e.target.checked)}
        />
        <span>Make me Head of this department</span>
      </label>
    </form>
  </Modal>
);

export default AddDepartmentModal;
