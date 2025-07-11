import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import styles from "./CenteredTaskModal.module.css";

const CenteredTaskModal = ({ 
  isOpen, 
  onClose, 
  header, 
  leftContent, 
  rightContent,
  closeOnOverlayClick = true
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div 
      className={styles.overlay} 
      onClick={handleOverlayClick}
      data-testid="modal-overlay"
    >
      <div 
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.headerRow}>
          <h2 id="modal-title" className={styles.title}>
            {header}
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.contentWrapper}>
          <main className={styles.leftCol}>
            <div className={styles.leftContentWrapper}>
              {leftContent}
            </div>
          </main>
          <aside className={styles.rightCol}>
            <div className={styles.rightContentWrapper}>
              {rightContent}
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

CenteredTaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  header: PropTypes.node,
  leftContent: PropTypes.node,
  rightContent: PropTypes.node,
  closeOnOverlayClick: PropTypes.bool
};

export default CenteredTaskModal;