// src/components/KPIBoard/KPIDetails/KpiMainFields.js
import React from "react";
import { useKpiUserRole } from "../../../hooks/useKpiUserRole";
import styles from "./KpiMainFields.module.css";

const KpiMainFields = ({ localKpi, onStatusChange, ALL_STATUSES }) => {
  const { isCreator, isAssignedUser } = useKpiUserRole(localKpi);

  if (!localKpi?._id) return null;

  /*───────────── Meta strings ─────────────*/
  const departments =
    localKpi.departments?.map((d) => d.name).join(", ") || "—";

  const assignments =
    [
      localKpi.assignedUsers?.length &&
        `${localKpi.assignedUsers.length} users`,
      localKpi.assignedRoles?.join(", "),
    ]
      .filter(Boolean)
      .join(" • ") || "—";

  /*───────────── Status options ───────────*/
  let baseOptions;
  if (isCreator) {
    baseOptions = ALL_STATUSES;
  } else if (isAssignedUser) {
    baseOptions = ["Pending", "In Progress", "Completed"];
  } else {
    baseOptions = [localKpi.status];
  }

  // Ensure current status is present so the <select> never falls back to blank
  const statusOptions = baseOptions.includes(localKpi.status)
    ? baseOptions
    : [...baseOptions, localKpi.status];

  // Assignees can SEE “Approved” but cannot select it
  const isOptionDisabled = (status) =>
    isAssignedUser && !isCreator && status === "Approved";

  /*───────────── Render ───────────*/
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{localKpi.name}</h2>
        {localKpi.description && <p>{localKpi.description}</p>}
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Departments</label>
          <span>{departments}</span>
        </div>

        <div className={styles.field}>
          <label>Assigned</label>
          <span>{assignments}</span>
        </div>

        <div className={styles.field}>
          <label>Status</label>
          {statusOptions.length > 1 ? (
            <select
              value={localKpi.status}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={!isCreator && !isAssignedUser}
              className={styles.select}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} disabled={isOptionDisabled(s)}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <span className={`${styles.status} ${styles[localKpi.status]}`}>
              {localKpi.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiMainFields;
