import React from "react";
import styles from "./DepartmentStatus.module.css";

const DepartmentStatus = ({ departments }) => {
  return (
    <div className={styles.departmentStatus}>
      <h3 className={styles.title}>Department Performance</h3>

      <div className={styles.departmentList}>
        {departments.map((dept, i) => {
          const pct = Math.round((dept.completed / dept.total) * 100);
          const barColor =
            dept.performance >= 80 ? "#2CA85C" :
            dept.performance >= 60 ? "#FF9800" : "#F44336";

          return (
            <div key={i} className={styles.departmentItem}>
              <div className={styles.deptInfo}>
                <h4 className={styles.deptName}>{dept.name}</h4>
                <span className={styles.deptMeta}>
                  {dept.completed}/{dept.total} KPIs Completed
                </span>
              </div>

              <div className={styles.deptProgress}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <span className={styles.progressPct}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentStatus;
