import React from "react";
import styles from "./ScoreComparisonChart.module.css";

const ScoreComparisonChart = ({ assigneeScore, creatorScore }) => {
  // Extract numeric values safely
  const assigneeValue = assigneeScore?.value ?? 0;
  const creatorValue = creatorScore?.value ?? 0;

  const maxScore = Math.max(assigneeValue, creatorValue, 10); // Ensure minimum scale
  const assigneePercentage = (assigneeValue / maxScore) * 100;
  const creatorPercentage = (creatorValue / maxScore) * 100;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.barGroup}>
        <div className={styles.barLabel}>Assignee</div>
        <div className={styles.barBackground}>
          <div
            className={`${styles.bar} ${styles.assigneeBar}`}
            style={{ width: `${assigneePercentage}%` }}
          >
            <span className={styles.barValue}>{assigneeValue}</span>
          </div>
        </div>
      </div>

      <div className={styles.barGroup}>
        <div className={styles.barLabel}>Creator</div>
        <div className={styles.barBackground}>
          <div
            className={`${styles.bar} ${styles.creatorBar}`}
            style={{ width: `${creatorPercentage}%` }}
          >
            <span className={styles.barValue}>{creatorValue}</span>
          </div>
        </div>
      </div>

      <div className={styles.scale}>
        {[0, Math.round(maxScore / 2), maxScore].map((num) => (
          <span key={num}>{num}</span>
        ))}
      </div>
    </div>
  );
};

export default ScoreComparisonChart;
