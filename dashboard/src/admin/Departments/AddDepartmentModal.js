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
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    header="Add New Faculty / Unit"
    footer={
      <>
        <button onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button onClick={onSave} className={styles.saveButton}>
          Save
        </button>
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
    </form>
  </Modal>
);

export default AddDepartmentModal;
