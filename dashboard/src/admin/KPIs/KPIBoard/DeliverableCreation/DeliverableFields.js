import React from "react";
import { FaPaperclip, FaCalendarAlt } from "react-icons/fa";
import styles from "./DeliverablesSection.module.css";

const defaultPatterns = ["Daily", "Weekly", "Monthly", "Yearly"];

const DeliverableFields = ({
  idx,
  deliverable,
  errors,
  handleDeliverableChange,
  handleFileChange,
}) => {
  const isCustom = deliverable.isRecurring && !defaultPatterns.includes(deliverable.recurrencePattern);
  const selectValue = isCustom ? "Custom" : deliverable.recurrencePattern;

  return (
    <div className={styles.formGrid}>
      {/* Title */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Title *
          <input
            type="text"
            value={deliverable.title}
            onChange={(e) => handleDeliverableChange(idx, "title", e.target.value)}
            className={`${styles.input} ${errors?.[`deliverable-title-${idx}`] ? styles.inputError : ""}`}
            placeholder="Enter deliverable title"
          />
        </label>
        {errors?.[`deliverable-title-${idx}`] && (
          <span className={styles.fieldError}>{errors[`deliverable-title-${idx}`]}</span>
        )}
      </div>

      {/* Action */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Action
          <input
            type="text"
            value={deliverable.action}
            onChange={(e) => handleDeliverableChange(idx, "action", e.target.value)}
            className={styles.input}
            placeholder="What action is required?"
          />
        </label>
      </div>

      {/* Indicator */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Indicator
          <input
            type="text"
            value={deliverable.indicator}
            onChange={(e) => handleDeliverableChange(idx, "indicator", e.target.value)}
            className={styles.input}
            placeholder="How will success be measured?"
          />
        </label>
      </div>

      {/* Performance Target */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Target
          <input
            type="text"
            value={deliverable.performanceTarget}
            onChange={(e) => handleDeliverableChange(idx, "performanceTarget", e.target.value)}
            className={styles.input}
            placeholder="Expected performance target"
          />
        </label>
      </div>

      {/* Recurring Toggle */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Recurring?
          <input
            type="checkbox"
            checked={deliverable.isRecurring}
            onChange={(e) => handleDeliverableChange(idx, "isRecurring", e.target.checked)}
            className={styles.checkbox}
          />
        </label>
      </div>

      {/* Conditional: Timeline or Recurrence Pattern */}
      {deliverable.isRecurring ? (
        <>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Recurrence Pattern *
              <select
                value={selectValue}
                onChange={(e) => {
                  const val = e.target.value;
                  handleDeliverableChange(
                    idx,
                    "recurrencePattern",
                    val === "Custom"
                      ? (isCustom ? deliverable.recurrencePattern : "")
                      : val
                  );
                }}
                className={`${styles.select} ${errors?.[`deliverable-recurrencePattern-${idx}`] ? styles.inputError : ""}`}
              >
                <option value="">Select pattern</option>
                {defaultPatterns.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Custom">Custom…</option>
              </select>
            </label>
            {errors?.[`deliverable-recurrencePattern-${idx}`] && (
              <span className={styles.fieldError}>
                {errors[`deliverable-recurrencePattern-${idx}`]}
              </span>
            )}
          </div>

          {isCustom && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Custom Pattern *
                <input
                  type="text"
                  value={deliverable.recurrencePattern}
                  onChange={(e) =>
                    handleDeliverableChange(idx, "recurrencePattern", e.target.value)
                  }
                  className={styles.input}
                  placeholder="e.g. Every 2 weeks"
                />
              </label>
            </div>
          )}
        </>
      ) : (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Timeline *
            <div className={styles.dateInputWrapper}>
              <FaCalendarAlt className={styles.dateIcon} />
              <input
                type="date"
                value={deliverable.timeline}
                onChange={(e) => handleDeliverableChange(idx, "timeline", e.target.value)}
                className={`${styles.input} ${styles.dateInput} ${errors?.[`deliverable-timeline-${idx}`] ? styles.inputError : ""}`}
              />
            </div>
          </label>
          {errors?.[`deliverable-timeline-${idx}`] && (
            <span className={styles.fieldError}>{errors[`deliverable-timeline-${idx}`]}</span>
          )}
        </div>
      )}

      {/* Priority */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Priority
          <select
            value={deliverable.priority}
            onChange={(e) => handleDeliverableChange(idx, "priority", e.target.value)}
            className={styles.select}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
      </div>

      {/* Evidence File */}
      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
        <label className={styles.label}>
          Evidence Attachment
          <div className={styles.fileUpload}>
            <label className={styles.fileUploadLabel}>
              <FaPaperclip className={styles.fileIcon} />
              <span>{deliverable.fileName || "Choose file (PDF, Word, JPG)"}</span>
              <input
                type="file"
                onChange={(e) => handleFileChange(idx, e)}
                className={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg"
              />
            </label>
            {deliverable.fileError && (
              <span className={styles.fileError}>{deliverable.fileError}</span>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default DeliverableFields;
