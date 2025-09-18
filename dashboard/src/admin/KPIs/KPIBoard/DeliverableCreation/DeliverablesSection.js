import React from "react";
import { FaPlus } from "react-icons/fa";
import styles from "./DeliverablesSection.module.css";
import DeliverableCard from "./DeliverableCard";

const DeliverablesSection = ({ newKpi, setNewKpi, errors }) => {
  /* ────────── helpers ────────── */
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
      fileError: null,
      isRecurring: false,
      recurrencePattern: "Daily",
      promoteGlobally: true,
    };
    setNewKpi((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable],
    }));
  };

  const removeDeliverable = (index) =>
    setNewKpi((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));

  const handleDeliverableChange = (index, field, value) => {
    const updated = [...newKpi.deliverables];
    updated[index][field] = value;
    setNewKpi((prev) => ({ ...prev, deliverables: updated }));
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    const updated = [...newKpi.deliverables];

    if (!file) {
      updated[index].evidenceFile = null;
      updated[index].fileName = "";
      updated[index].fileError = null;
      return setNewKpi((p) => ({ ...p, deliverables: updated }));
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      updated[index].fileError = "Only PDF, Word docs, and JPGs allowed";
    } else if (file.size > maxSize) {
      updated[index].fileError = "File exceeds 5MB limit";
    } else {
      updated[index].evidenceFile = file;
      updated[index].fileName = file.name;
      updated[index].fileError = null;
    }
    setNewKpi((p) => ({ ...p, deliverables: updated }));
  };

  /* ────────── render ────────── */
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
          <DeliverableCard
            key={idx}
            idx={idx}
            deliverable={deliverable}
            errors={errors}
            removeDeliverable={removeDeliverable}
            handleDeliverableChange={handleDeliverableChange}
            handleFileChange={handleFileChange}
          />
        ))}
      </div>

      <button type="button" onClick={addDeliverable} className={styles.addButton}>
        <FaPlus /> Add New Deliverable
      </button>
    </div>
  );
};

export default DeliverablesSection;
