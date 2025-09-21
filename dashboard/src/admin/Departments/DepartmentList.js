// src/admin/Departments/DepartmentList.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./DepartmentList.module.css";
import Modal from "../../UI/modal/Modal";

const DepartmentList = ({
  departments,
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
}) => {
  const [activeDept, setActiveDept] = useState(null);
  const close = () => setActiveDept(null);

  return (
    <>
      <div className={styles.grid}>
        {departments.map((dept) => {
        
          const uname = dept?.name || "Department";
          const initial = String(uname).charAt(0).toUpperCase();

          return (
            <motion.div
              key={dept._id}
              className={styles.card}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className={styles.glowEffect}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.25, scale: 1.05 }}
                transition={{ duration: 0.25 }}
              />

              {/* Header */}
              <motion.div
                className={styles.cardHeader}
                onClick={() => setActiveDept(dept)}
                whileHover={{
                  background: "linear-gradient(135deg, #0c4335 0%, #0b2a40 80%)",
                }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  className={styles.avatar}
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {initial}
                </motion.div>

                <div className={styles.titleContainer}>
                  <h3 title={uname}>{uname}</h3>
                  <span className={styles.roleBadge}>{dept.category || "—"}</span>
                </div>

                <div className={styles.headerActions}>
                  <motion.button
                    type="button"
                    className={styles.viewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDept(dept);
                    }}
                    aria-label={`View ${uname}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Body (1-line preview) */}
              {dept.description && (
                <motion.div
                  className={styles.cardBody}
                  onClick={() => setActiveDept(dept)}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ delay: 0.08 }}
                >
                  <div className={styles.infoRow}>
                    <span className={styles.preview} title={dept.description}>
                      {dept.description}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!activeDept}
        onClose={close}
        header={activeDept ? `Department: ${activeDept.name}` : "Department"}
      >
        {activeDept && (
          <>
            {activeDept.description && (
              <p className={styles.detailRow}>
                <strong>Description:</strong> {activeDept.description}
              </p>
            )}
            <p className={styles.detailRow}>
              <strong>Category:</strong> {activeDept.category}
            </p>
            <p className={styles.detailRow}>
              <strong>Created By:</strong>{" "}
              {activeDept?.createdBy?.fullName || "Unknown"}
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  if (canEdit(activeDept)) {
                    onEdit(activeDept);
                    close();
                  }
                }}
                disabled={!canEdit(activeDept)}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>

              <button
                className={styles.actionButtonDanger}
                onClick={() => {
                  if (canDelete(activeDept)) {
                    onDelete(activeDept._id);
                    close();
                  }
                }}
                disabled={!canDelete(activeDept)}
              >
                <FontAwesomeIcon icon={faTrashAlt} /> Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default DepartmentList;
