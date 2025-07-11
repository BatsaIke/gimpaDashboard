import React from "react";
import styles from "./HistoryTimeline.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFlag,
  faCalendarAlt,
  faCheck,
  faUser
} from "@fortawesome/free-solid-svg-icons";

const getActionIcon = (action) => {
  switch(action) {
    case 'meeting-booked':
      return faCalendarAlt;
    case 'resolved':
      return faCheck;
    default:
      return faFlag;
  }
};

const formatActionText = (action) => {
  const actions = {
    'created': 'Discrepancy created',
    'meeting-booked': 'Meeting booked',
    'resolved': 'Discrepancy resolved'
  };
  return actions[action] || action;
};

const HistoryTimeline = ({ history = [], discrepancy }) => {
  if (history.length === 0) {
    return (
      <div className={styles.emptyTimeline}>
        No history available for this discrepancy
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {history.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineIcon}>
            <FontAwesomeIcon icon={getActionIcon(item.action)} />
          </div>
          <div className={styles.timelineContent}>
            <div className={styles.timelineHeader}>
              <span className={styles.action}>{formatActionText(item.action)}</span>
              <span className={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
            <div className={styles.timelineUser}>
              <FontAwesomeIcon icon={faUser} />
              {item.by?.fullName || item.by?.username || 'System'}
            </div>

            {/* Add original reason (always show) */}
            {discrepancy?.reason && (
              <div className={styles.timelineReason}>
                <strong>Reason:</strong> {discrepancy.reason}
              </div>
            )}

            {/* Add resolution notes only if this is the resolved action */}
            {item.action === 'resolved' && discrepancy?.resolutionNotes && (
              <div className={styles.timelineResolution}>
                <strong>Resolution:</strong> {discrepancy.resolutionNotes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTimeline;
