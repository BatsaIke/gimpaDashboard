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
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    header="Edit Faculty / Unit"
    footer={
      <>
        <button onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button onClick={onSave} className={styles.saveButton}>
          Save Changes
        </button>
      </>
    }
  >
    <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="editName">Name:</label>
      <input
        id="editName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={styles.input}
      />

      <label htmlFor="editDesc">Description:</label>
      <textarea
        id="editDesc"
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
    </form>
  </Modal>
);

export default EditDepartmentModal;
