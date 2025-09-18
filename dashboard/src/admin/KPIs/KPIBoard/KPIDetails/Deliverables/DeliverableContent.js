// src/components/KPIBoard/KPIDetails/Deliverables/DeliverableContent.jsx
import React, { useMemo, useState, useEffect } from "react"; // Added useEffect
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faCalendarAlt,
  faFlag,
  faBullseye,
  faExclamationTriangle,
  faCheck,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import DeliverableCompletion from "./DeliverableCompletion/DeliverableCompletion";
import DeliverableReview from "./DeliverableReview/DeliverableReview";
import clsx from "clsx";
import styles from "./DeliverableItem.module.css";
import useSelectedOccurrence from "../../../../hooks/deliverables/useSelectedOccurrence";

const DeliverableContent = ({
  index,
  d,
  kpiId,
  statuses,
  currentStatus,
  onStatusChange,
  isOpenDiscrepancy,
  isResolvedDiscrepancy,
  discrepancyTxt,
  resolutionTxt,
  meetingBooked, // This is now a boolean derived in DeliverableItem
  onBookMeeting, // This is DeliverableItem's internal handler
  showCompletionForm,
  showReviewForm,
  statusColorMap,
  onScoreChange,
  isAssignedUser,
  isCreator,
  reviewTargetUserId,
  canBookMeeting = false,
  discrepancy, // The full discrepancy object, directly from DeliverableItem
  onSelectedOccurrenceLabelChange, // Callback to report selected label
}) => {
  // Occurrence selection hook (manages selectedLabel internally)
  const { occurrences, selectedLabel, setSelectedLabel, selectedOccurrence, nextDue } =
    useSelectedOccurrence(d);

  // NEW: Report the current selectedLabel to the parent (DeliverableItem) whenever it changes
  useEffect(() => {
    if (onSelectedOccurrenceLabelChange) {
      onSelectedOccurrenceLabelChange(selectedLabel);
    }
  }, [selectedLabel, onSelectedOccurrenceLabelChange]);

  // Use the props directly for rendering banners and button logic.
  // These are already correctly computed in DeliverableItem from the `backendFlag`.
  const currentIsOpen = isOpenDiscrepancy;
  const currentIsResolved = isResolvedDiscrepancy;
  const currentMeetingBooked = meetingBooked; // Directly use the prop
  const currentDiscrepancyTxt = discrepancyTxt;
  const currentResolutionTxt = resolutionTxt;

  return (
    <div
      className={clsx(styles.deliverableItem, {
        [styles.withDiscrepancy]: currentIsOpen || currentIsResolved,
      })}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.deliverableNumber}>Deliverable {index + 1}</span>
          <h3 className={styles.title}>{d.title || "Untitled Deliverable"}</h3>
        </div>
        <div className={styles.statusWrapper}>
          <select
            value={currentStatus}
            onChange={onStatusChange}
            disabled={!isCreator && !isAssignedUser}
            className={styles.statusSelect}
            style={{ borderColor: statusColorMap[currentStatus] }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Discrepancy banners */}
      {currentIsOpen && (
        <div className={styles.discrepancyBanner}>
          <div className={styles.discrepancyContent}>
            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.discrepancyIcon} />
            <span className={styles.discrepancyText}>
              {currentDiscrepancyTxt}
              {currentMeetingBooked && ( // Use `currentMeetingBooked` prop
                <span className={styles.meetingBookedText}>(meeting booked)</span>
              )}
            </span>
          </div>

          {/* Buttons for booking/disabling based on canBookMeeting prop */}
          {!currentMeetingBooked && (isCreator || isAssignedUser) && canBookMeeting && (
            <button className={styles.meetingBtn} onClick={onBookMeeting}>
              Book Resolution Meeting
            </button>
          )}
          {!currentMeetingBooked && (isCreator || isAssignedUser) && !canBookMeeting && (
            <button className={styles.meetingBtn} disabled title="No active discrepancy flag for this specific context (or meeting already booked).">
              Book Resolution Meeting
            </button>
          )}
        </div>
      )}

      {currentIsResolved && (
        <div className={styles.discrepancyBannerResolved}>
          <div className={styles.discrepancyContent}>
            <FontAwesomeIcon icon={faCheck} className={styles.discrepancyIconResolved} />
            <span className={styles.discrepancyText}>
              Discrepancy resolved — {currentDiscrepancyTxt}
              {currentResolutionTxt && (
                <>
                  <br />
                  <em>Resolution:</em> {currentResolutionTxt}
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Details grid (unchanged) */}
      <div className={styles.detailsGrid}>
        {[
          { icon: faFileAlt, label: "Action", value: d.action },
          { icon: faBullseye, label: "Indicator", value: d.indicator },
          { icon: faFlag, label: "Priority", value: d.priority },
          {
            icon: faCalendarAlt,
            label: "Timeline",
            value: d.isRecurring
              ? `Recurring: ${d.recurrencePattern || "Yes"}${
                  occurrences.length ? ` (${occurrences.length})` : ""
                }`
              : d.timeline
              ? new Date(d.timeline).toLocaleDateString()
              : "N/A",
            extra:
              !d.isRecurring && d.timeline && new Date(d.timeline) < new Date() && (
                <span className={styles.overdueBadge}>
                  <FontAwesomeIcon icon={faClock} /> Overdue
                </span>
              ),
          },
        ].map(({ icon, label, value, extra }) => (
          <div key={label} className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <FontAwesomeIcon icon={icon} />
            </div>
            <div>
              <div className={styles.detailLabel}>{label}</div>
              <div className={styles.detailValue}>
                {value || "N/A"} {extra}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Occurrence Picker (recurring) */}
      {d.isRecurring && occurrences.length > 0 && (
        <div className={styles.evidenceSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.sectionIcon} />
            Select Occurrence
          </h4>
          <select
            className={styles.statusSelect}
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            {occurrences.map((o) => (
              <option key={o.periodLabel} value={o.periodLabel}>
                {o.periodLabel} {o.status ? `• ${o.status}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Evidence sections (unchanged) */}
      {d.evidence?.length > 0 && (
        <div className={styles.evidenceSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFileAlt} className={styles.sectionIcon} />
            Supporting Documents
          </h4>
          <div className={styles.evidenceList}>
            {d.evidence.map((url, i) => (
              <a
                key={i}
                href={url}
                download
                className={styles.evidenceLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <span className={styles.fileName}>{url.split("/").pop()}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {d.isRecurring && selectedOccurrence?.evidence?.length > 0 && (
        <div className={styles.evidenceSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFileAlt} className={styles.sectionIcon} />
            Evidence for {selectedLabel}
          </h4>
          <div className={styles.evidenceList}>
            {selectedOccurrence.evidence.map((url, i) => (
              <a
                key={i}
                href={url}
                download
                className={styles.evidenceLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <span className={styles.fileName}>{url.split("/").pop()}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Forms (unchanged - they pass `selectedLabel` now) */}
      {showCompletionForm && (
        <DeliverableCompletion
          kpiId={kpiId}
          index={index}
          deliverable={d}
          onScoreChange={onScoreChange}
          isAssignedUser={isAssignedUser}
          occurrences={occurrences}
          selectedOccurrenceLabel={selectedLabel}
        />
      )}
      {showReviewForm && (
        <DeliverableReview
          kpiId={kpiId}
          index={index}
          deliverable={d}
          onScoreChange={onScoreChange}
          isCreator={isCreator}
          occurrences={occurrences}
          selectedOccurrenceLabel={selectedLabel}
          assigneeId={reviewTargetUserId}
        />
      )}
    </div>
  );
};

export default DeliverableContent;