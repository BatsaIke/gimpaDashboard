import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Alert.module.css';

const Alert = () => {
  const alerts = useSelector((state) => state.alerts);

  return (
    <div className={styles.alertWrapper}>
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            className={`${styles.alert} ${styles[`alert${alert.alertType}`]}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className={styles.alertContent}>
              {alert.msg}
              <div className={styles.progressBar} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Alert;