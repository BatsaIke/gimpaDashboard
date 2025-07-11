// src/components/EmployeeActions.jsx
import React from "react";
import styles from "./EmployeeActions.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faRedo } from "@fortawesome/free-solid-svg-icons";

const EmployeeActions = ({ employee, onEdit, onDelete, onResetPassword }) => {
  return (
    <div className={styles.actionsContainer}>
      <button onClick={() => onEdit(employee)} className={styles.editButton}>
        <FontAwesomeIcon icon={faEdit} /> Edit
      </button>
      <button onClick={() => onDelete(employee._id)} className={styles.deleteButton}>
        <FontAwesomeIcon icon={faTrash} /> Delete
      </button>
      <button onClick={() => onResetPassword(employee._id)} className={styles.resetButton}>
        <FontAwesomeIcon icon={faRedo} /> Reset PW
      </button>
    </div>
  );
};

export default EmployeeActions;
