// src/components/DeliverableCompletion/DeliverableForm.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faTimes, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./DeliverableForm.module.css";
import { fetchUserKpis } from "../../../../../../actions/kpiActions";
import { handleAttachChange } from "../../../../../../utils/uploadEvidence";

const DeliverableForm = ({
  kpiId,
  index,
  deliverable,
  occurrenceLabel,      // required for recurring
  isAssignedUser,
  dispatch,
  authUser,
  handleSaveDeliverable,
  onScoreChange,
}) => {
  const [bufferScore, setBufferScore] = useState(deliverable.assigneeScore?.value ?? "");
  const [bufferNotes, setBufferNotes] = useState("");
  const [bufferFiles, setBufferFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const numericScore = Number(bufferScore);
  const scoreIsValid = !isNaN(numericScore) && numericScore >= 0 && numericScore <= 100;

  const needsOccurrence = deliverable?.isRecurring === true;
  const isSaveEnabled =
    scoreIsValid && bufferNotes.trim() && isAssignedUser && (!needsOccurrence || !!occurrenceLabel);

  const pickFiles = (files) => setBufferFiles((old) => [...old, ...Array.from(files)]);
  const uploadEvidence = handleAttachChange(dispatch, kpiId);

  const handleSave = async () => {
    if (!isSaveEnabled || isSaving) return;
    if (!deliverable?._id) {
      setSaveError("Missing deliverable ID.");
      return;
    }
    if (needsOccurrence && !occurrenceLabel) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // 1) Upload evidence first (you already use this path elsewhere)
      let uploadedUrls = [];
      if (bufferFiles.length) {
        const urls = await Promise.all(
          bufferFiles.map((f) => uploadEvidence(deliverable._id, occurrenceLabel, f))
        );
        uploadedUrls = urls.filter(Boolean);
      }

      // 2) Build updates payload the server expects (flat; occurrence targeted by top-level occurrenceLabel)
      const updates = {
        assigneeScore: {
          value: numericScore,
          notes: bufferNotes,
          ...(uploadedUrls.length && { supportingDocuments: uploadedUrls }),
        },
        status: "Completed",
        hasSavedAssignee: true,
      };

      // 3) Save via shared util (no `files` here since we already uploaded)
      await handleSaveDeliverable({
        dispatch,
        kpiId,
        index,
        actorId: authUser._id,                  // who is saving (enteredBy)
        assigneeId: authUser._id,               // slice to update (self)
        deliverableId: deliverable._id,         // deliverable template _id
        occurrenceLabel: needsOccurrence ? occurrenceLabel : null,
        scoreType: "assigneeScore",
        updates,
        onScoreChange,
      });

      // 4) Reset UI and refresh
      setBufferFiles([]);
      setBufferNotes("");
      setBufferScore("");
      await dispatch(fetchUserKpis(authUser?._id));
    } catch (err) {
      setSaveError(err?.message || "Failed to save, please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleScoreChange = (e) => {
  const value = e.target.value;
  // Only allow numbers (including empty string for deletion)
  if (value === '' || /^\d*$/.test(value)) {
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value, 10)));
    setBufferScore(numValue.toString());
  }
};

  return (
    <div className={styles.formBox}>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Your Score (0-100) <span className={styles.req}>*</span>
        </label>
       <input
  type="number"
  min="0"
  max="100"
  value={bufferScore}
  onChange={handleScoreChange}
  onBlur={() => {
    if (bufferScore === '') return;
    const numValue = Math.min(100, Math.max(0, parseInt(bufferScore, 10) || 0));
    setBufferScore(numValue.toString());
  }}
  className={styles.scoreInput}
  aria-invalid={!scoreIsValid}
/>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Completion Notes <span className={styles.req}>*</span>
        </label>
        <textarea
          rows={4}
          value={bufferNotes}
          onChange={(e) => setBufferNotes(e.target.value)}
          className={styles.notesInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Supporting Evidence</label>
        <div
          className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFiles(e.dataTransfer.files);
          }}
        >
          <label className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faPaperclip} />
            <span>Drag &amp; drop files or click to browse</span>
            <input
              type="file"
              multiple
              onChange={(e) => pickFiles(e.target.files)}
              className={styles.fileInput}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </div>

        {bufferFiles.length > 0 && (
          <ul className={styles.fileList}>
            {bufferFiles.map((f, i) => (
              <li key={i}>
                {f.name}
                <button
                  type="button"
                  onClick={() => setBufferFiles((old) => old.filter((_, j) => j !== i))}
                  className={styles.removeBtn}
                  aria-label="Remove file"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          disabled={!isSaveEnabled || isSaving}
          onClick={handleSave}
          className={styles.saveBtn}
        >
          {isSaving ? "Saving…" : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} /> Submit Completion
            </>
          )}
        </button>

        {needsOccurrence && !occurrenceLabel && (
          <p className={styles.hint}>
            Pick an occurrence above to enable submission.
          </p>
        )}

        {saveError && (
          <p className={styles.error}>
            <FontAwesomeIcon icon={faExclamationCircle} /> {saveError}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeliverableForm;
