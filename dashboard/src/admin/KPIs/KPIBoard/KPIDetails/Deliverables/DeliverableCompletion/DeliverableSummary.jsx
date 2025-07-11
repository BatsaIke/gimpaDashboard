// DeliverableSummary.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faStar } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './DeliverableSummary.module.css';

const DeliverableSummary = ({ deliverable }) => {
  const score = deliverable?.assigneeScore;

  return (
    <motion.div 
      className={styles.summaryBox}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.item}>
        <span className={styles.label}>Your Score</span>
        {score?.value ? (
          <div className={styles.value}>
            <span className={styles.scoreValue}>
              <FontAwesomeIcon icon={faStar} style={{ marginRight: 6 }} />
              {score.value}/100
            </span>
          </div>
        ) : (
          <span className={styles.value}>—</span>
        )}
      </div>

      {score?.notes && (
        <motion.div 
          className={styles.item}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.label}>Your Notes</span>
          <p className={styles.value}>{score.notes}</p>
        </motion.div>
      )}

      {score?.supportingDocuments?.length > 0 && (
        <motion.div 
          className={styles.evidenceSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.label}>Supporting Evidence</span>
          <div className={styles.evidenceList}>
            {score.supportingDocuments.map((file, i) => (
              <motion.a
                key={i}
                href={file}
                download
                className={styles.evidenceLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FontAwesomeIcon icon={faPaperclip} />
                {file.split('/').pop()}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DeliverableSummary;