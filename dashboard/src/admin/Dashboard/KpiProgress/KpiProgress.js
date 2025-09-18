import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTriangleExclamation as faExclamationTriangle,
  faClock,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./KpiProgress.module.css";

const KpiProgress = ({ title, progress, target, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed": return faCheckCircle;
      case "warning": return faExclamationTriangle;
      case "pending": return faClock;
      default: return faTasks;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed": return "#2CA85C";
      case "warning": return "#FF9800";
      case "pending": return "#F44336";
      default: return "#002F5F";
    }
  };

  return (
    <div className={styles.kpiProgress}>
      <div className={styles.kpiHeader}>
        <h4 className={styles.title}>{title}</h4>
        <FontAwesomeIcon icon={getStatusIcon()} style={{ color: getStatusColor() }} />
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%`, backgroundColor: getStatusColor() }} />
      </div>

      <div className={styles.kpiStats}>
        <span>{progress}% Complete</span>
        <span>Target: {target}%</span>
      </div>
    </div>
  );
};

export default KpiProgress;
