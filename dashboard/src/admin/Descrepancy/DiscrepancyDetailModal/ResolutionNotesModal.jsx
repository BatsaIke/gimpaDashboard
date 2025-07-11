import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./ResolutionNotesModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faStickyNote } from "@fortawesome/free-solid-svg-icons";

const ResolutionNotesModal = ({
  isOpen,
  onClose,
  onConfirm,
  discrepancy
}) => {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [apiError, setApiError] = useState(null); // New state for API errors

  if (!isOpen) return null;

  const handleSubmit = async (e) => { // Changed to async
    e.preventDefault();
    const trimmed = resolutionNotes.trim();
    if (!trimmed) {
      alert("Please enter resolution notes");
      return;
    }
    
    setApiError(null); // Reset error before new submission
    try {
      await onConfirm(trimmed); // Assuming onConfirm returns a promise
    } catch (error) {
      // Capture and display the API error
      setApiError(error.message || "Failed to submit resolution notes. Please try again.");
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>Add Resolution Notes</h3>
            <p className={styles.subtitle}>
              Resolving: {discrepancy?.kpiId?.name || `KPI ${discrepancy?.kpiId}`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faStickyNote} />
              Resolution Notes
            </label>
            <textarea
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className={styles.textarea}
              rows={5}
              placeholder="Explain clearly why the issue occurred and how it was resolved."
              required
            />
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className={styles.errorMessage}>
              {apiError}
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Mark as Resolved
            </button>
          </div>
        </form>
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default ResolutionNotesModal;