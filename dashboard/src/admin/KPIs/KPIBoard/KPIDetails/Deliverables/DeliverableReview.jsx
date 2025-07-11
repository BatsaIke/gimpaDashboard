import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { handleSaveDeliverable } from "../../../../../utils/saveDeliverable";
import styles from "./DeliverableReview.module.css";
import { fetchKpiHeaders } from "../../../../../actions/kpiHeaderActions";

const DeliverableReview = ({
  kpiId,
  index,
  deliverable = {},
  onScoreChange,
  onAttachChange,
  isCreator,
}) => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);

  // State management
  const [bufferScore, setBufferScore] = useState(
    deliverable?.creatorScore?.value ?? ""
  );
  const [bufferNotes, setBufferNotes] = useState(
    deliverable?.creatorNotes ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Derived state
  const assigneeHasScore = deliverable?.assigneeScore?.value !== undefined;
  const isReviewed =
    deliverable?.hasSavedCreator ||
    deliverable?.creatorScore?.value !== undefined;
  const isSaveEnabled =
    isCreator &&
    assigneeHasScore &&
    !isNaN(bufferScore) &&
    bufferScore >= 0 &&
    bufferScore <= 100;

  // Sync state with props
  useEffect(() => {
    if (isReviewed) {
      setBufferScore(deliverable?.creatorScore?.value ?? "");
      setBufferNotes(deliverable?.creatorNotes ?? "");
    }
  }, [isReviewed, deliverable]);

  // Save handler with modern async/await
  const handleSave = async () => {
    if (!isSaveEnabled || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
  await handleSaveDeliverable({
    dispatch,
    kpiId,
    index,
    userId: authUser?._id,
    assigneeId: deliverable?.assigneeScore?.enteredBy,
    updates: {
      creatorScore: {
        value: Number(bufferScore),
        enteredBy: authUser?._id,
        timestamp: new Date(),
        notes: bufferNotes || "",
        supportingDocuments:
          deliverable?.creatorScore?.supportingDocuments || [],
      },
    },
    onScoreChange,
    onAttachChange,
    scoreType: "creatorScore",
    originalDeliverable: deliverable,
  });

  // 🔄 Refresh full KPI board after review save
  await dispatch(fetchKpiHeaders());

  onScoreChange(index, Number(bufferScore), "creator");
} catch (err) {
  console.error("Save failed:", err);
  setSaveError(err?.message || "Failed to save review. Please try again.");
} finally {
  setIsSaving(false);
}

  };

  return (
    <motion.div
      className={styles.reviewCard}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h4 className={styles.reviewTitle} whileHover={{ scale: 1.02 }}>
        Review Deliverable
      </motion.h4>

      <AnimatePresence>
        {!assigneeHasScore && (
          <motion.div
            className={styles.infoMessage}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>⏳</span> Assignee must complete their score before you can
            review.
          </motion.div>
        )}
      </AnimatePresence>

      {isReviewed ? (
        <motion.div
          className={styles.reviewSummary}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <p>
            <strong>Your Score:</strong>{" "}
            <span className={styles.scoreValue}>
              {deliverable?.creatorScore?.value ?? "N/A"}
            </span>
          </p>
          {deliverable?.creatorScore?.notes && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <strong>Your Notes:</strong> {deliverable.creatorScore.notes}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <motion.div
          className={styles.reviewForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.formGroup}>
            <motion.label className={styles.inputLabel} whileHover={{ x: 2 }}>
              Your Score (0-100)
            </motion.label>
            <motion.input
              type="number"
              min="0"
              max="100"
              value={bufferScore}
              onChange={(e) => setBufferScore(e.target.value)}
              className={styles.scoreInput}
              disabled={!assigneeHasScore}
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className={styles.formGroup}>
            <motion.label className={styles.inputLabel} whileHover={{ x: 2 }}>
              Your Review Notes
            </motion.label>
            <motion.textarea
              rows={3}
              value={bufferNotes}
              onChange={(e) => setBufferNotes(e.target.value)}
              className={styles.notesInput}
              placeholder="Enter your review notes..."
              disabled={!assigneeHasScore}
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className={styles.formActions}>
            <motion.button
              type="button"
              className={`${styles.saveButton} ${
                isSaving ? styles.saving : ""
              }`}
              onClick={handleSave}
              disabled={!isSaveEnabled || isSaving}
              whileHover={!isSaving && isSaveEnabled ? { scale: 1.03 } : {}}
              whileTap={!isSaving && isSaveEnabled ? { scale: 0.98 } : {}}
            >
              {isSaving ? (
                <>
                  <span className={styles.spinner} />
                  Saving...
                </>
              ) : (
                "Save Review"
              )}
            </motion.button>

            <AnimatePresence>
              {saveError && (
                <motion.p
                  className={styles.errorMessage}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {saveError}
                </motion.p>
              )}
            </AnimatePresence>

            {!isSaving && !isSaveEnabled && (
              <motion.div
                className={styles.validationMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {!isCreator
                  ? "You need review permissions"
                  : !assigneeHasScore
                  ? "Wait for assignee submission"
                  : !bufferScore
                  ? "Enter valid score (0-100)"
                  : "Complete all required fields"}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DeliverableReview;
