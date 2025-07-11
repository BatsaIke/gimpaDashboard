// src/components/KPIBoard/EmptyKpiState/EmptyKpiState.js
import React from 'react';
import styles from './EmptyKpiState.module.css';
import { FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

const EmptyKpiState = ({ onCreateClick }) => {
  return (
    <motion.div 
      className={styles.emptyState}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.glassCard}>
        <div className={styles.content}>
          <h3>No KPIs Yet</h3>
          <p>Get started by creating your first KPI to track important metrics</p>
          
          <motion.button
            className={styles.createButton}
            onClick={onCreateClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus size={18} />
            Create First KPI
          </motion.button>
        </div>
        
        <div className={styles.glassOverlay} />
      </div>
    </motion.div>
  );
};

export default EmptyKpiState;