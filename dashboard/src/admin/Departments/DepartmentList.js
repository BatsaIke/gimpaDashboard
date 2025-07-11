import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faUserTie } from "@fortawesome/free-solid-svg-icons";
import styles from "./DepartmentList.module.css";

const DepartmentList = ({ departments, onEdit, onDelete }) => (
  <div className={styles.grid}>
    {departments.map((dept) => (
      <div key={dept._id} className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={faUserTie} className={styles.avatarIcon} />
          </div>
          <div className={styles.titleContainer}>
            <h3>{dept.name}</h3>
            <span className={styles.categoryBadge}>{dept.category}</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          {dept.description && (
            <p className={styles.description}>{dept.description}</p>
          )}
          <div className={styles.metaInfo}>
            <span className={styles.metaLabel}>Created By:</span>
            <span>{dept?.createdBy?.fullName || "Unknown"}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button 
            onClick={() => onEdit(dept)} 
            className={styles.actionButton}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button 
            onClick={() => onDelete(dept._id)} 
            className={styles.actionButtonDanger}
          >
            <FontAwesomeIcon icon={faTrashAlt} /> Delete
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default DepartmentList;