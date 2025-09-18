// ==========================
// EmployeeDetailModal.jsx (unchanged except safe guards)
// ==========================
import React from "react";
import ReactDOM from "react-dom";
import stylesDetail from "./EmployeeDetailModal.module.css";
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

  const uname = employee.username || employee.email || "?";

  return ReactDOM.createPortal(
    <>
      <div className={stylesDetail.overlay} onClick={onClose} />
      <div className={stylesDetail.modal}>
        <header className={stylesDetail.header}>
          <div className={stylesDetail.avatar}>
            {String(uname).charAt(0).toUpperCase()}
          </div>
          <div className={stylesDetail.headerContent}>
            <h3>{uname}</h3>
            <p className={stylesDetail.role}>{employee.role}</p>
          </div>
          <button className={stylesDetail.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <section className={stylesDetail.contentGrid}>
          <div className={stylesDetail.colLeft}>
            <div className={stylesDetail.infoItem}>
              <span className={stylesDetail.infoLabel}>Email:</span>
              <span className={stylesDetail.infoValue}>{employee.email || 'N/A'}</span>
            </div>
            <div className={stylesDetail.infoItem}>
              <span className={stylesDetail.infoLabel}>Phone:</span>
              <span className={stylesDetail.infoValue}>{employee.phone || 'N/A'}</span>
            </div>
            <div className={stylesDetail.infoItem}>
              <span className={stylesDetail.infoLabel}>Department:</span>
              <span className={stylesDetail.infoValue}>
                {employee.department?.name || 'None'}
              </span>
            </div>
          </div>
          <div className={stylesDetail.colRight}>
            <div className={stylesDetail.infoItem}>
              <span className={stylesDetail.infoLabel}>Rank:</span>
              <span className={stylesDetail.infoValue}>{employee.rank || 'N/A'}</span>
            </div>
            <div className={stylesDetail.infoItem}>
              <span className={stylesDetail.infoLabel}>Status:</span>
              <span className={stylesDetail.statusActive}>Active</span>
            </div>
          </div>
        </section>

        <footer className={stylesDetail.footer}>
          <button 
            className={stylesDetail.actionBtn} 
            onClick={() => onEdit(employee)}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button 
            className={stylesDetail.actionBtnDanger} 
            onClick={() => onDelete(employee._id)}
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
          <button 
            className={stylesDetail.actionBtnSecondary}
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
