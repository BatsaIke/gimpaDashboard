import React from 'react';
import { motion } from 'framer-motion';
import styles from './Spinner.module.css';

const Spinner = () => (
  <motion.div 
    className={styles.spinnerContainer}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={styles.spinnerWrapper}>
      <motion.div
        className={styles.spinner}
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear",
          duration: 1.5 
        }}
      >
        <div className={styles.spinnerInner} />
      </motion.div>
      
      <motion.p
        className={styles.spinnerText}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading content...
        <span className={styles.ellipsis}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </motion.p>
    </div>
  </motion.div>
);

export default Spinner;