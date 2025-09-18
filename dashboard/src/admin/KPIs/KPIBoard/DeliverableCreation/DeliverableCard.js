import React from "react";
import { FaTrash } from "react-icons/fa";
import styles from "./DeliverablesSection.module.css";
import DeliverableFields from "./DeliverableFields";

const DeliverableCard = ({
  idx,
  deliverable,
  errors,
  removeDeliverable,
  handleDeliverableChange,
  handleFileChange,
}) => (
  <div className={styles.card}>
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

    <DeliverableFields
      idx={idx}
      deliverable={deliverable}
      errors={errors}
      handleDeliverableChange={handleDeliverableChange}
      handleFileChange={handleFileChange}
    />
  </div>
);

export default DeliverableCard;
