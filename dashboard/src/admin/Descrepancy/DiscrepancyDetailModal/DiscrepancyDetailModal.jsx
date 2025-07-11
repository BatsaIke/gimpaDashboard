import React from "react";
import ReactDOM from "react-dom";
import styles from "./DiscrepancyDetailModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalendarAlt,
  faCheck,
  faHistory,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import ScoreComparisonChart from "../ScoreComparisonChart/ScoreComparisonChart";
import HistoryTimeline from "../ScoreComparisonChart/HistoryTimeline";

const DiscrepancyDetailModal = ({
  isOpen,
  onClose,
  discrepancy,
  onBookMeeting,
  onResolve,
}) => {
  if (!isOpen || !discrepancy) return null;

  // Get names
  const kpiName = discrepancy.kpiId?.name || `KPI ${discrepancy.kpiId?._id || "N/A"}`;
  const deliverableTitle =
  discrepancy.kpiId?.deliverables?.[discrepancy.delIndex]?.title ||
  `Deliverable ${discrepancy.delIndex + 1}`;

  // Determine if meeting is booked
  const isMeetingBooked =
    (discrepancy.meeting && discrepancy.meeting.timestamp) ||
    (discrepancy.meetingDate && discrepancy.booked);

  // Use meeting info object (from discrepancy.meeting or fallback)
  const meetingInfo = discrepancy.meeting || {
    timestamp: discrepancy.meetingDate,
    bookedBy: discrepancy.bookedBy,
    notes: discrepancy.notes,
  };

  // Determine bookedBy display
 let bookedByDisplay = "User";
if (meetingInfo.bookedBy) {
  const { fullName, username, email } = meetingInfo.bookedBy;
  bookedByDisplay = fullName || username || "User";
  if (email) bookedByDisplay += ` (${email})`;
}



  return ReactDOM.createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>Discrepancy Details</h3>
            <p className={styles.subtitle}>
              {kpiName} • {deliverableTitle}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <section className={styles.content}>
          <div className={styles.scoreSection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Score Comparison
            </h4>
            <ScoreComparisonChart
              assigneeScore={discrepancy.assigneeScore}
              creatorScore={discrepancy.creatorScore}
            />
            <div className={styles.reasonBox}>
              <h5>Reason for Flag</h5>
              <p>{discrepancy.reason || "No reason provided."}</p>
            </div>
          </div>

          <div className={styles.meetingSection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              Meeting Information
            </h4>
            {isMeetingBooked ? (
              <div className={styles.meetingInfo}>
                <div className={styles.infoRow}>
                  <span>Date:</span>
                  <span>
                    {new Date(meetingInfo.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span>Booked By:</span>
                  <span>{bookedByDisplay}</span>
                </div>
                {meetingInfo.notes && (
                  <div className={styles.infoRow}>
                    <span>Notes:</span>
                    <p>{meetingInfo.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noMeeting}>
                <p>No meeting booked yet</p>
                <button
                  onClick={() => {
                    onClose();
                    onBookMeeting(discrepancy);
                  }}
                  className={styles.bookButton}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Book Meeting
                </button>
              </div>
            )}
          </div>

          <div className={styles.historySection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHistory} />
              History Timeline
            </h4>
            <HistoryTimeline history={discrepancy.history} />
          </div>
        </section>

        <footer className={styles.footer}>
          {!discrepancy.resolved && (
            <button
              onClick={() => onResolve(discrepancy)}
              className={styles.resolveButton}
            >
              <FontAwesomeIcon icon={faCheck} />
              Mark as Resolved
            </button>
          )}
        </footer>
      </div>
    </>,
    document.getElementById("modal-root")
  );
};

export default DiscrepancyDetailModal;
