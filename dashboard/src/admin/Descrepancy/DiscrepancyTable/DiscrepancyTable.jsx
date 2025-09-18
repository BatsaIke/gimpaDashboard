import React, { useState, useMemo } from "react";
import styles from "./DiscrepancyTable.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCalendarAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import PaginationControls from "../../../components/pagination/Pagination";

const ITEMS_PER_PAGE = 20; // Define how many items to show per page

const truncate = (str, maxLength = 20) => {
  if (!str) return "—";
  return str.length > maxLength ? str.substring(0, maxLength) + "…" : str;
};

const DiscrepancyTable = ({
  discrepancies, // This will be the full list of discrepancies
  onView,
  onBookMeeting,
  onResolve,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort discrepancies by flaggedAt (most recent first) and then apply pagination
  const sortedAndPaginatedDiscrepancies = useMemo(() => {
    // 1. Sort by flaggedAt in descending order (most recent on top)
    const sorted = [...discrepancies].sort((a, b) => {
      const dateA = new Date(a.flaggedAt || 0); // Use 0 for null/undefined dates to put them at the beginning
      const dateB = new Date(b.flaggedAt || 0);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    // 2. Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [discrepancies, currentPage]); // Re-calculate when discrepancies or currentPage changes

  const totalPages = Math.ceil(discrepancies.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

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
          {sortedAndPaginatedDiscrepancies.map((d) => {
            const kpiName = d.kpiId?.name
              ? truncate(d.kpiId.name, 25)
              : `KPI ${d.kpiId?._id || "N/A"}`;

            const deliverableTitle =
              d.kpiId?.deliverables &&
              d.kpiId.deliverables[d.delIndex] &&
              d.kpiId.deliverables[d.delIndex].title
                ? truncate(d.kpiId.deliverables[d.delIndex].title, 25)
                : `Deliverable ${d.delIndex + 1}`;

            const isMeetingBooked = d.booked;

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
                      {new Date(d.meeting?.timestamp).toLocaleDateString()}
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
                      {!isMeetingBooked ? (
                        <button
                          onClick={() => onBookMeeting(d)}
                          className={styles.actionBtnSecondary}
                          aria-label="Book meeting"
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </button>
                      ) : (
                        <button
                          className={styles.actionBtnSecondary}
                          aria-label="Meeting booked"
                          title="Meeting already booked"
                          disabled
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </button>
                      )}

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

      {/* Pagination Controls */}
      {discrepancies.length > ITEMS_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      )}
    </div>
  );
};

export default DiscrepancyTable;
