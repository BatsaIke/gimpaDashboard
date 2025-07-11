// DeliverableSessionItem.js
import React from "react";
import styles from "./DeliverablesSection.module.css";

const DeliverableSessionItem = ({ 
  deliverable, 
  index, 
  handleDeliverableChange, 
  handleFileChange, 
  removeDeliverable 
}) => {
  return (
    <div className={styles.deliverableCard}>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Title
          <textarea
            type="text"
            value={deliverable.title}
            onChange={(e) => handleDeliverableChange(index, "title", e.target.value)}
            className={styles.textInput}
            placeholder="Enter deliverable title"
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Action
          <textarea
            value={deliverable.action}
            onChange={(e) => handleDeliverableChange(index, "action", e.target.value)}
            className={styles.textareaInput}
            placeholder="Describe the action"
            rows={3}
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Indicator
          <textarea
            value={deliverable.indicator}
            onChange={(e) => handleDeliverableChange(index, "indicator", e.target.value)}
            className={styles.textareaInput}
            placeholder="Key performance indicator"
            rows={3}
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Performance Target
          <textarea
            type="text"
            value={deliverable.performanceTarget}
            onChange={(e) => handleDeliverableChange(index, "performanceTarget", e.target.value)}
            className={styles.textInput}
            placeholder="Target value or metric"
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Timeline
          <input
            type="date"
            value={deliverable.timeline}
            onChange={(e) => handleDeliverableChange(index, "timeline", e.target.value)}
            className={styles.dateInput}
          />
        </label>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Priority
          <select
            value={deliverable.priority}
            onChange={(e) => handleDeliverableChange(index, "priority", e.target.value)}
            className={styles.selectInput}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
      </div>

      <div className={styles.fileUploadRow}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Supporting Document
            <div className={styles.fileUploadWrapper}>
              <label className={styles.fileUploadLabel}>
                {deliverable.fileName || "Choose file (PDF/DOC/Image)"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg"
                  onChange={(e) => handleFileChange(index, e)}
                  className={styles.fileInput}
                />
              </label>
              {deliverable.fileName && (
                <span className={styles.fileName}>{deliverable.fileName}</span>
              )}
              {deliverable.fileError && (
                <span className={styles.fileError}>{deliverable.fileError}</span>
              )}
            </div>
          </label>
        </div>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => removeDeliverable(index)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default DeliverableSessionItem;