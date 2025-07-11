// src/components/EmployeeDetailModal/EmployeeDetailModal.jsx
import React from "react";
import ReactDOM from "react-dom";
import styles from "./EmployeeDetailModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faTrash, faRedo } from "@fortawesome/free-solid-svg-icons";

const EmployeeDetailModal = ({ 
  isOpen, 
  onClose, 
  employee, 
  onEdit, 
  onDelete,
  onResetPassword 
}) => {
  if (!isOpen || !employee) return null;

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.avatar}>
            {employee.username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.headerContent}>
            <h3>{employee.username}</h3>
            <p className={styles.role}>{employee.role}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <section className={styles.contentGrid}>
          <div className={styles.colLeft}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{employee.email || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone:</span>
              <span className={styles.infoValue}>{employee.phone || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Department:</span>
              <span className={styles.infoValue}>
                {employee.department?.name || 'None'}
              </span>
            </div>
          </div>
          <div className={styles.colRight}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rank:</span>
              <span className={styles.infoValue}>{employee.rank || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={styles.statusActive}>Active</span>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <button 
            className={styles.actionBtn} 
            onClick={() => onEdit(employee)}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button 
            className={styles.actionBtnDanger} 
            onClick={() => onDelete(employee._id)}
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
          <button 
            className={styles.actionBtnSecondary}
            onClick={() => onResetPassword(employee._id)}
          >
            <FontAwesomeIcon icon={faRedo} /> Reset Password
          </button>
        </footer>
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default EmployeeDetailModal;