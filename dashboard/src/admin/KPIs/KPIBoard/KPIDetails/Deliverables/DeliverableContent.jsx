import React from "react";
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
import DeliverableReview from "./DeliverableReview";
import clsx from "clsx";
import styles from "./DeliverableItem.module.css";

const DeliverableContent = ({
  index,
  d,
  kpiId,
  statuses,
  currentStatus,
  onStatusChange,
  /* discrepancy props */
  isOpenDiscrepancy,
  isResolvedDiscrepancy,
  discrepancyTxt,
  resolutionTxt,
  meetingBooked,
  onBookMeeting,
  /* forms */
  showCompletionForm,
  showReviewForm,
  statusColorMap,
  onAttachChange,
  onScoreChange,
  isAssignedUser,
  isCreator,
}) => (
  <div
    className={clsx(styles.deliverableItem, {
      [styles.withDiscrepancy]: isOpenDiscrepancy || isResolvedDiscrepancy,
    })}
  >
    {/* Header */}
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.deliverableNumber}>
          Deliverable {index + 1}
        </span>
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
    {isOpenDiscrepancy && (
      <div className={styles.discrepancyBanner}>
        <div className={styles.discrepancyContent}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.discrepancyIcon}
          />
          <span className={styles.discrepancyText}>
            {discrepancyTxt}
            {meetingBooked && (
              <span className={styles.meetingBookedText}>
                (meeting booked)
              </span>
            )}
          </span>
        </div>
        {!meetingBooked && (isCreator || isAssignedUser) && (
          <button className={styles.meetingBtn} onClick={onBookMeeting}>
            Book Resolution Meeting
          </button>
        )}
      </div>
    )}

    {isResolvedDiscrepancy && (
      <div className={styles.discrepancyBannerResolved}>
        <div className={styles.discrepancyContent}>
          <FontAwesomeIcon
            icon={faCheck}
            className={styles.discrepancyIconResolved}
          />
          <span className={styles.discrepancyText}>
            Discrepancy resolved — {discrepancyTxt}
            {resolutionTxt && (
              <>
                <br />
                <em>Resolution:</em> {resolutionTxt}
              </>
            )}
          </span>
        </div>
      </div>
    )}

    {/* Details grid */}
    <div className={styles.detailsGrid}>
      {[
        { icon: faFileAlt, label: "Action", value: d.action },
        { icon: faBullseye, label: "Indicator", value: d.indicator },
        { icon: faFlag, label: "Priority", value: d.priority },
        {
          icon: faCalendarAlt,
          label: "Timeline",
          value: d.timeline
            ? new Date(d.timeline).toLocaleDateString()
            : "N/A",
          extra:
            d.timeline && new Date(d.timeline) < new Date() && (
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

    {/* Evidence */}
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

    {/* Forms */}
    {showCompletionForm && (
      <DeliverableCompletion
        kpiId={kpiId}
        index={index}
        deliverable={d}
        onAttachChange={onAttachChange}
        onScoreChange={onScoreChange}
        isAssignedUser={isAssignedUser}
      />
    )}
    {showReviewForm && (
      <DeliverableReview
        kpiId={kpiId}
        index={index}
        deliverable={d}
        onScoreChange={onScoreChange}
        onAttachChange={onAttachChange}
        isCreator={isCreator}
      />
    )}
  </div>
);

export default DeliverableContent;
