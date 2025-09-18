// DeliverableSummary.jsx
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faStar, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './DeliverableSummary.module.css';

const DeliverableSummary = ({
  deliverable,
  occurrence,          // optional: single occurrence
  isRecurring,         // optional: boolean
  occurrenceDate,      // optional: YYYY-MM-DD label
  scoreData,           // { assigneeScore, creatorScore, isOccurrence, occurrenceDate }
}) => {
  const { score, sourceTag } = useMemo(() => {
    if (scoreData?.assigneeScore) {
      return { score: scoreData.assigneeScore, sourceTag: scoreData.isOccurrence ? 'occurrence' : 'deliverable' };
    }
    if (occurrence?.assigneeScore) {
      return { score: occurrence.assigneeScore, sourceTag: 'occurrence' };
    }
    if (deliverable?.assigneeScore) {
      return { score: deliverable.assigneeScore, sourceTag: 'deliverable' };
    }
    return { score: null, sourceTag: null };
  }, [scoreData, occurrence, deliverable]);

  const evidence = useMemo(() => {
    const files = score?.supportingDocuments;
    return Array.isArray(files) ? files : [];
  }, [score]);

  const showOccurrencePill = Boolean(
    (isRecurring || scoreData?.isOccurrence || sourceTag === 'occurrence') &&
    (occurrenceDate || scoreData?.occurrenceDate || occurrence?.periodLabel)
  );

  const occLabel =
    occurrenceDate ||
    scoreData?.occurrenceDate ||
    occurrence?.periodLabel ||
    null;

  return (
    <motion.div
      className={styles.summaryBox}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {showOccurrencePill && (
        <div className={styles.occurrencePill}>
          <FontAwesomeIcon icon={faCalendarAlt} /> {occLabel}
        </div>
      )}

      <div className={styles.item}>
        <span className={styles.label}>Your Score</span>
        {score?.value != null ? (
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

      {evidence.length > 0 && (
        <motion.div
          className={styles.evidenceSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.label}>Your Supporting Evidence</span>
          <div className={styles.evidenceList}>
            {evidence.map((file, i) => (
              <motion.a
                key={i}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
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
