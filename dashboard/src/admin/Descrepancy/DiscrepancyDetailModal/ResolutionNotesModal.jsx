import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./ResolutionNotesModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faStickyNote, faFileUpload, faStar } from "@fortawesome/free-solid-svg-icons";

const ResolutionNotesModal = ({ isOpen, onClose, onConfirm, discrepancy }) => {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newScore, setNewScore] = useState("");
  const [file, setFile] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [scoreError, setScoreError] = useState("");

  if (!isOpen) return null;

  const handleScoreChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setNewScore("");
      setScoreError("");
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      setScoreError("Please enter a valid number");
      return;
    }

    if (numValue < 0 || numValue > 100) {
      setScoreError("Score must be between 0 and 100");
      return;
    }

    setNewScore(value);
    setScoreError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = resolutionNotes.trim();
    if (!trimmed) {
      alert("Please enter resolution notes");
      return;
    }

    if (scoreError) {
      return;
    }

    setApiError(null);
    try {
      await onConfirm({
        notes: trimmed,
        newScore: newScore ? Number(newScore) : undefined,
        file,
      });
    } catch (error) {
      setApiError(error.message || "Failed to submit resolution notes. Please try again.");
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>Resolve Discrepancy</h3>
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
              <FontAwesomeIcon icon={faStickyNote} /> Resolution Notes
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className={styles.textarea}
              rows={5}
              placeholder="Explain why the discrepancy happened and how it was resolved."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faStar} /> New Score (optional)
            </label>
            <input
              type="number"
              className={styles.input}
              min={0}
              max={100}
              step="0.01"
              value={newScore}
              onChange={handleScoreChange}
              placeholder="Enter corrected score (0-100)"
            />
            {scoreError && <span className={styles.errorText}>{scoreError}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faFileUpload} /> Supporting File (optional)
            </label>
            <input
              type="file"
              className={styles.input}
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>

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