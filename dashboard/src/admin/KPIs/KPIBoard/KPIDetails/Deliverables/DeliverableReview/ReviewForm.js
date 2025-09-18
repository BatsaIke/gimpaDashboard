// ReviewForm.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./DeliverableReview.module.css";

const clamp0to100 = (n) => {
  if (Number.isNaN(n)) return NaN;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
};

const ReviewForm = ({
  isCreator,
  isRecurring,
  hasTargetOccurrence,     // true for non-recurring; must be selected for recurring
  assigneeHasScore,
  initialScore,
  initialNotes,
  onSubmit,                // ({ value, notes, files })
}) => {
  const [score, setScore] = useState(initialScore);
  const [notes, setNotes] = useState(initialNotes);
  const [files, setFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState(null);

  const scoreNum = useMemo(() => clamp0to100(Number(score)), [score]);
  const scoreIsValid = useMemo(
    () => typeof scoreNum === "number" && !Number.isNaN(scoreNum),
    [scoreNum]
  );

  const canSave = isCreator && assigneeHasScore && scoreIsValid && hasTargetOccurrence;

  useEffect(() => {
    setScore(initialScore);
    setNotes(initialNotes);
    setFiles([]);
    setErr(null);
  }, [initialScore, initialNotes]);

  // files
  const addFiles = useCallback((pickedList) => {
    const picked = Array.from(pickedList || []);
    if (!picked.length) return;
    setFiles((prev) => {
      const sig = (f) => `${f.name}::${f.size}`;
      const existing = new Set(prev.map(sig));
      const next = picked.filter((f) => !existing.has(sig(f)));
      return next.length ? [...prev, ...next] : prev;
    });
  }, []);

  const handleFilePick = (e) => addFiles(e.target.files);
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave || isSaving) return;
    setIsSaving(true);
    setErr(null);
    try {
      await onSubmit({ value: scoreNum, notes, files });
      setFiles([]);
    } catch (ex) {
      setErr(ex?.message || "Failed to save review. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const disabled = !assigneeHasScore || (isRecurring && !hasTargetOccurrence);
  const disabledHint = useMemo(() => {
    if (!assigneeHasScore) return "Assignee must submit their score first.";
    if (isRecurring && !hasTargetOccurrence) return "Pick an occurrence to review.";
    if (!scoreIsValid) return "Enter a score between 0 and 100.";
    return null;
  }, [assigneeHasScore, isRecurring, hasTargetOccurrence, scoreIsValid]);
const handleScoreChange = (e) => {
  const value = e.target.value;
  // Only allow numbers (including empty string for deletion)
  if (value === '' || /^\d*$/.test(value)) {
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value, 10)));
    setScore(numValue.toString());
  }
};

  return (
    <form className={styles.reviewForm} onSubmit={submit}>
      <label className={styles.inputLabel}>
        Your Score (0–100)
        <input
  type="number"
  min="0"
  max="100"
  value={score}
  onChange={handleScoreChange}
  onBlur={() => {
    if (score === '') return;
    const numValue = Math.min(100, Math.max(0, parseInt(score, 10) || 0));
    setScore(numValue.toString());
  }}
  disabled={disabled}
  className={styles.scoreInput}
  inputMode="numeric"
  pattern="[0-9]*"
  aria-invalid={!scoreIsValid}
/>

      </label>

      <label className={styles.inputLabel}>
        Your Review Notes
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          className={styles.notesInput}
        />
      </label>

      <div className={styles.uploadBlock}>
        <label className={styles.inputLabel}>
          Upload extra documents (optional)
          <input
            type="file"
            multiple
            disabled={disabled}
            onChange={handleFilePick}
            className={styles.fileInput}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>

        {files.length > 0 && (
          <ul className={styles.fileList}>
            {files.map((file, i) => (
              <li key={`${file.name}-${file.size}-${i}`}>
                {file.name}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className={styles.removeBtn}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={!canSave || isSaving} className={styles.saveButton}>
          {isSaving ? "Saving…" : "Save Review"}
        </button>

        {!isSaving && !canSave && disabledHint && (
          <p className={styles.infoMessage}>{disabledHint}</p>
        )}

        {err && <p className={styles.error}>{err}</p>}
      </div>
    </form>
  );
};

export default ReviewForm;
