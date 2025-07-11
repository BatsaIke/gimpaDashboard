import React from "react";
import styles from "./DiscrepancyTable.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCalendarAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const truncate = (str, maxLength = 20) => {
  if (!str) return "—";
  return str.length > maxLength ? str.substring(0, maxLength) + "…" : str;
};

const DiscrepancyTable = ({
  discrepancies,
  onView,
  onBookMeeting,
  onResolve,
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>KPI</th>
            <th>Deliverable</th>
            <th>Scores</th>
            <th>Status</th>
            <th>Meeting</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {discrepancies.map((d) => {
            const kpiName = d.kpiId?.name
              ? truncate(d.kpiId.name, 25)
              : `KPI ${d.kpiId?._id || "N/A"}`;

            const deliverableTitle =
              d.kpiId?.deliverables &&
              d.kpiId.deliverables[d.delIndex] &&
              d.kpiId.deliverables[d.delIndex].title
                ? truncate(d.kpiId.deliverables[d.delIndex].title, 25)
                : `Deliverable ${d.delIndex + 1}`;

            const isMeetingBooked = !!(d.meeting && d.meeting.timestamp);

            return (
              <tr key={d.id}>
                <td>{kpiName}</td>
                <td>{deliverableTitle}</td>
                <td className={styles.scoresCell}>
                  <span className={styles.assigneeScore}>
                    {d.assigneeScore?.value ?? "—"}
                  </span>
                  <span className={styles.vs}>vs</span>
                  <span className={styles.creatorScore}>
                    {d.creatorScore?.value ?? "—"}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      d.resolved ? styles.resolved : styles.active
                    }`}
                  >
                    {d.resolved ? "Resolved" : "Active"}
                  </span>
                </td>
                <td>
                  {isMeetingBooked ? (
                    <span className={styles.meetingBadge}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {new Date(d.meeting.timestamp).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className={styles.noMeeting}>Not booked</span>
                  )}
                </td>

                <td className={styles.actionsCell}>
                  <button
                    onClick={() => onView(d)}
                    className={styles.actionBtn}
                    aria-label="View details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {!d.resolved && (
                    <>
                      <button
                        onClick={() => onBookMeeting(d)}
                        className={styles.actionBtnSecondary}
                        aria-label="Book meeting"
                      >
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </button>
                      <button
                        onClick={() => onResolve(d)}
                        className={styles.actionBtnSuccess}
                        aria-label="Resolve"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DiscrepancyTable;
