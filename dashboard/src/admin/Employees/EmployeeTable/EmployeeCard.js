// src/components/EmployeeTable/EmployeeCard.jsx
import React from "react";
import styles from "./EmployeeCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserTie, 
  faEnvelope, 
  faPhone, 
  faBuilding 
} from "@fortawesome/free-solid-svg-icons";

const EmployeeCard = ({ 
  employee, 
  onEdit, 
  onDelete, 
  onResetPassword, 
  onView 
}) => {
  return (
    <div className={styles.card} onClick={() => onView(employee)}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          {employee.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.titleContainer}>
          <h3>{employee.username}</h3>
          <span className={styles.roleBadge}>{employee.role}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
          <span>{employee.email || 'No email'}</span>
        </div>
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faPhone} className={styles.icon} />
          <span>{employee.phone || 'No phone'}</span>
        </div>
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faBuilding} className={styles.icon} />
          <span>{employee.department?.name || 'No department'}</span>
        </div>
      </div>

      <div className={styles.cardFooter} onClick={e => e.stopPropagation()}>
        <button 
          className={styles.actionButton}
          onClick={() => onEdit(employee)}
        >
          Edit
        </button>
        <button 
          className={styles.actionButtonDanger}
          onClick={() => onDelete(employee._id)}
        >
          Delete
        </button>
        <button 
          className={styles.actionButtonSecondary}
          onClick={() => onResetPassword(employee._id)}
        >
          Reset PW
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;