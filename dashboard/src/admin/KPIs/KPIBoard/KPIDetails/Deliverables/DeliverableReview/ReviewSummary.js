// ReviewSummary.jsx
import React from "react";
import styles from "./DeliverableReview.module.css";
import EvidenceList from "./EvidenceList";

const hasNumber = (v) => typeof v === "number" && !Number.isNaN(v);

const ReviewSummary = ({
  // NEW preferred props
  creatorScore,
  creatorEvidence,

  // Legacy props (fallbacks)
  scoreValue,
  notes = "",
  evidence = [],
}) => {
  // Normalize into a single source of truth
  const scoreObj =
    creatorScore ??
    (scoreValue !== undefined || notes || evidence?.length
      ? { value: scoreValue, notes, supportingDocuments: evidence }
      : null);

  const value = hasNumber(scoreObj?.value) ? scoreObj.value : null;
  const textNotes = scoreObj?.notes || "";
  const docs = Array.isArray(creatorEvidence)
    ? creatorEvidence
    : Array.isArray(scoreObj?.supportingDocuments)
    ? scoreObj.supportingDocuments
    : [];

  return (
    <div className={styles.reviewSummary}>
      <p>
        <strong>Your Score:&nbsp;</strong>
        <span className={styles.scoreValue}>{value ?? "N/A"}</span>
      </p>

      {textNotes && (
        <p>
          <strong>Your Notes:&nbsp;</strong>
          {textNotes}
        </p>
      )}

      {docs.length > 0 && (
        <>
          <p className={styles.mt16}>
            <strong>Your Supporting Docs:</strong>
          </p>
          <EvidenceList urls={docs} />
        </>
      )}
    </div>
  );
};

export default ReviewSummary;
