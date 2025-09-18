import React from "react";
import styles from "./ProfilePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClock, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

const titleOf = (k) => k?.title || k?.name || "Untitled KPI";
const statusOf = (k) => (k?.status || "unknown").toLowerCase();
const iconOf = (status) => {
  if (status.includes("done") || status.includes("completed")) return faCheckCircle;
  if (status.includes("pending") || status.includes("in") || status.includes("ongoing")) return faClock;
  return faCircleExclamation;
};

const KpiList = ({ kpis }) => {
  return (
    <section className={`${styles.cardWide} ${styles.glass}`}>
      <h2 className={styles.cardTitle}>KPIs Assigned to You</h2>
      {(!kpis || kpis.length === 0) ? (
        <div className={styles.empty}>No KPIs assigned yet.</div>
      ) : (
        <div className={styles.kpiList}>
          {kpis.slice(0, 6).map((k) => {
            const st = statusOf(k);
            return (
              <div key={String(k?._id || k?.id || titleOf(k))} className={styles.kpiItem}>
                <div className={styles.kpiTitleRow}>
                  <span className={styles.kpiTitle}>{titleOf(k)}</span>
                </div>
                <div className={styles.kpiMeta}>
                  <span className={`${styles.kpiStatus} ${styles[`st_${st}`]} ${styles.glassSoft}`}>
                    <FontAwesomeIcon icon={iconOf(st)} />
                    <b>{st || "unknown"}</b>
                  </span>
                  {k?.assignee && (
                    <span className={`${styles.kpiAssignee} ${styles.glassSoft}`}>
                      Assignee: {typeof k.assignee === "object"
                        ? (k.assignee.fullName || k.assignee.username)
                        : String(k.assignee)}
                    </span>
                  )}
                  {k?.department && (
                    <span className={`${styles.kpiDept} ${styles.glassSoft}`}>
                      Dept: {typeof k.department === "object"
                        ? (k.department.name || "")
                        : String(k.department)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default KpiList;
