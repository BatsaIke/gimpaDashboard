import React from 'react';
import styles from './DeliverableHeader.module.css';

const DeliverableHeader = ({ hasDone }) => (
  <div className={styles.header}>
    <h3 className={styles.title}>Deliverable Completion</h3>
    {!hasDone && <span className={styles.required}>Required</span>}
  </div>
);

export default DeliverableHeader;