import React from "react";
import styles from "./DiscrepancyStats.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";

const DiscrepancyStats = ({ stats }) => {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.total}`}>
          <FontAwesomeIcon icon={faFlag} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.total || 0}</span>
          <span className={styles.statLabel}>Total Flags</span>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.resolved}`}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.resolved || 0}</span>
          <span className={styles.statLabel}>Resolved</span>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.pending}`}>
          <FontAwesomeIcon icon={faClock} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.pending || 0}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
      </div>
    </div>
  );
};

export default DiscrepancyStats;