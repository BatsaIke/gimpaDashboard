import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DeliverableReview.module.css";
import EvidenceList from "./EvidenceList";
import ReviewForm from "./ReviewForm";
import ReviewSummary from "./ReviewSummary";
import OccurrencePicker from "../DeliverableCompletion/OccurrencePicker";
import { useDeliverableReview } from "./DeliverableReviewLogic";

// Local helper function since it's not exported from Logic file
const hasNumber = (v) => typeof v === "number" && !Number.isNaN(v);

const DeliverableReview = ({
  kpiId,
  index,
  isCreator = true,
  assigneeId,
  selectedOccurrenceLabel = null,
  onSelectOccurrence = () => {},
  onScoreChange,
}) => {
  const {
    deliverable,
    isRecurring,
    enrichedOccurrences,
    effectiveOccurrenceLabel,
    assigneeHasScore,
    reviewedByCreator,
    assigneeEvidence,
    creatorScore,
    creatorEvidence,
    hasTargetOccurrence,
    saveCreatorReview
  } = useDeliverableReview({
    kpiId,
    index,
    assigneeId,
    selectedOccurrenceLabel,
    onSelectOccurrence,
    onScoreChange
  });

  return (
    <motion.div
      className={styles.reviewCard}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!deliverable ? (
        <div className={styles.loading}>Loading deliverable...</div>
      ) : (
        <>
          <h4 className={styles.reviewTitle}>
            Review Deliverable
            {isRecurring && effectiveOccurrenceLabel ? ` — ${effectiveOccurrenceLabel}` : ""}
          </h4>

          {isRecurring && (
            <OccurrencePicker
              occurrences={enrichedOccurrences}
              value={effectiveOccurrenceLabel || ""}
              onChange={onSelectOccurrence}
            />
          )}

          <AnimatePresence>
            {!assigneeHasScore && (
              <motion.div
                className={styles.infoMessage}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>⏳</span> Assignee must submit their score first.
              </motion.div>
            )}
            {isRecurring && !effectiveOccurrenceLabel && (
              <motion.div
                className={styles.infoMessage}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>📅</span> Pick an occurrence to review.
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.assigneeEvidenceBox}>
            <strong>Supporting documents from assignee:</strong>
            <EvidenceList urls={assigneeEvidence} />
          </div>

          {reviewedByCreator ? (
            <ReviewSummary creatorScore={creatorScore} creatorEvidence={creatorEvidence} />
          ) : (
            <ReviewForm
              key={`${index}-${effectiveOccurrenceLabel || "na"}`}
              isCreator={isCreator}
              isRecurring={isRecurring}
              hasTargetOccurrence={hasTargetOccurrence}
              assigneeHasScore={assigneeHasScore}
              initialScore={hasNumber(creatorScore?.value) ? String(creatorScore.value) : ""}
              initialNotes={creatorScore?.notes ?? ""}
              onSubmit={saveCreatorReview}
            />
          )}
        </>
      )}
    </motion.div>
  );
};

export default DeliverableReview;