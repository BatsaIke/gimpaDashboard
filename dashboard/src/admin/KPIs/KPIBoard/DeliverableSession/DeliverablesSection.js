import React from "react";
import { FaPlus, FaTrash, FaPaperclip, FaCalendarAlt } from "react-icons/fa";
import styles from "./DeliverablesSection.module.css";

const DeliverablesSection = ({ newKpi, setNewKpi, errors }) => {
  const addDeliverable = () => {
    const newDeliverable = {
      title: "",
      action: "",
      indicator: "",
      performanceTarget: "",
      timeline: "",
      priority: "Medium",
      evidenceFile: null,
      fileName: "",
      fileError: null
    };

    setNewKpi((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable],
    }));
  };

  const removeDeliverable = (index) => {
    setNewKpi((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleDeliverableChange = (index, field, value) => {
    const updatedDeliverables = [...newKpi.deliverables];
    updatedDeliverables[index][field] = value;
    setNewKpi((prev) => ({ ...prev, deliverables: updatedDeliverables }));
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    const updatedDeliverables = [...newKpi.deliverables];
    
    if (!file) {
      updatedDeliverables[index].evidenceFile = null;
      updatedDeliverables[index].fileName = "";
      updatedDeliverables[index].fileError = null;
      setNewKpi((prev) => ({ ...prev, deliverables: updatedDeliverables }));
      return;
    }

    const validTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg"
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      updatedDeliverables[index].fileError = "Only PDF, Word docs, and JPGs allowed";
    } else if (file.size > maxSize) {
      updatedDeliverables[index].fileError = "File exceeds 5MB limit";
    } else {
      updatedDeliverables[index].evidenceFile = file;
      updatedDeliverables[index].fileName = file.name;
      updatedDeliverables[index].fileError = null;
    }

    setNewKpi((prev) => ({ ...prev, deliverables: updatedDeliverables }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Deliverables</h3>
        {errors?.deliverables && (
          <span className={styles.error}>{errors.deliverables}</span>
        )}
      </div>

      <div className={styles.deliverablesList}>
        {newKpi.deliverables.map((deliverable, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumber}>Deliverable {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeDeliverable(idx)}
                className={styles.deleteButton}
                aria-label="Remove deliverable"
              >
                <FaTrash />
              </button>
            </div>

            <div className={styles.formGrid}>
              {/* Title */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Title *
                  <input
                    type="text"
                    value={deliverable.title}
                    onChange={(e) => handleDeliverableChange(idx, "title", e.target.value)}
                    className={`${styles.input} ${
                      errors?.[`deliverable-title-${idx}`] ? styles.inputError : ""
                    }`}
                    placeholder="Enter deliverable title"
                  />
                </label>
                {errors?.[`deliverable-title-${idx}`] && (
                  <span className={styles.fieldError}>
                    {errors[`deliverable-title-${idx}`]}
                  </span>
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

              {/* Timeline */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Timeline *
                  <div className={styles.dateInputWrapper}>
                    <FaCalendarAlt className={styles.dateIcon} />
                    <input
                      type="date"
                      value={deliverable.timeline}
                      onChange={(e) => handleDeliverableChange(idx, "timeline", e.target.value)}
                      className={`${styles.input} ${styles.dateInput} ${
                        errors?.[`deliverable-timeline-${idx}`] ? styles.inputError : ""
                      }`}
                    />
                  </div>
                </label>
                {errors?.[`deliverable-timeline-${idx}`] && (
                  <span className={styles.fieldError}>
                    {errors[`deliverable-timeline-${idx}`]}
                  </span>
                )}
              </div>

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

              {/* File Upload */}
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Evidence Attachment
                  <div className={styles.fileUpload}>
                    <label className={styles.fileUploadLabel}>
                      <FaPaperclip className={styles.fileIcon} />
                      <span>
                        {deliverable.fileName || "Choose file (PDF, Word, JPG)"}
                      </span>
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
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDeliverable}
        className={styles.addButton}
      >
        <FaPlus />
        Add New Deliverable
      </button>
    </div>
  );
};

export default DeliverablesSection;