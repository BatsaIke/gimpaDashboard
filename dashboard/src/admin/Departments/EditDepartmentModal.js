import React from "react";
import styles from "./ModalForm.module.css";
import Modal from "../../UI/modal/Modal";

const EditDepartmentModal = ({
  isOpen,
  onClose,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  onSave,
}) => {
  const valid = name.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header="Edit Faculty / Unit"
      footer={
        <div className={styles.footerRow}>
          <button onClick={onClose} className={styles.cancelButton} type="button">
            Cancel
          </button>
          <button
            onClick={onSave}
            className={styles.saveButton}
            type="button"
            disabled={!valid}
            aria-disabled={!valid}
          >
            Save Changes
          </button>
        </div>
      }
      contentClassName={styles.modalContent}
    >
      <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formHeader}>
          <h4 className={styles.formTitle}>Update details</h4>
          <p className={styles.formSubtitle}>
            Change the name, description, or category, then save.
          </p>
        </div>

        <label htmlFor="editName" className={styles.label}>Name</label>
        <input
          id="editName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
          placeholder="e.g., GIMPA Business School (GBS)"
        />

        <label htmlFor="editDesc" className={styles.label}>Description</label>
        <textarea
          id="editDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          placeholder="What does this department focus on?"
        />

        <label className={styles.label}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          <option value="Faculty">Faculty</option>
          <option value="Unit">Unit</option>
        </select>
      </form>
    </Modal>
  );
};

export default EditDepartmentModal;
