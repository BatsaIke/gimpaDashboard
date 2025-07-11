import React from "react";
import styles from "./RecentDiscrepancies.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

const RecentDiscrepancies = ({ discrepancies }) => {
  return (
    <div className={styles.recentContainer}>
      <h3 className={styles.sectionTitle}>
        <FontAwesomeIcon icon={faClock} />
        Recent Discrepancies
      </h3>
      
      {discrepancies.length === 0 ? (
        <div className={styles.emptyState}>
          No recent discrepancies found
        </div>
      ) : (
        <ul className={styles.discrepancyList}>
          {discrepancies.slice(0, 5).map((d) => (
            <li key={d._id} className={styles.discrepancyItem}>
              <div className={styles.itemHeader}>
                <span className={styles.kpiName}>
                  {d.kpiId?.name || `KPI ${d.kpiId}`}
                </span>
                <span className={`${styles.status} ${d.resolved ? styles.resolved : styles.pending}`}>
                  {d.resolved ? 'Resolved' : 'Pending'}
                </span>
              </div>
              <div className={styles.itemDetails}>
                Deliverable {d.deliverableIndex + 1} • 
                Flagged on {new Date(d.flaggedAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentDiscrepancies;