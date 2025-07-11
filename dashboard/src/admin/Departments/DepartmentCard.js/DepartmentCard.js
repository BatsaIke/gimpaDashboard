import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./DepartmentCard.module.css";
import { removeDepartment } from "../redux/actions/departmentActions";
import Modal from "../UI/modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faUserTie, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const DepartmentCard = ({ department, onEdit }) => {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    dispatch(removeDepartment(department._id));
    setDeleteModalOpen(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faUserTie} className={styles.avatarIcon} />
        </div>
        <div className={styles.titleContainer}>
          <h3>{department.name}</h3>
          <span className={styles.categoryBadge}>{department.category}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        {department.description && (
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faInfoCircle} className={styles.icon} />
            <span>{department.description}</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Created By:</span>
          <span>{department?.createdBy?.fullName || "Unknown"}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button 
          onClick={() => onEdit(department)} 
          className={styles.actionButton}
        >
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button 
          onClick={handleDelete} 
          className={styles.actionButtonDanger}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} header="Confirm Delete">
        <p>Are you sure you want to delete the department <strong>{department.name}</strong>?</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
          <button className={styles.confirmBtn} onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentCard;