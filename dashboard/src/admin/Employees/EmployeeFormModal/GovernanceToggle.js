import React from "react";
import styles from "./EmployeeFormFields.module.css";

const GovernanceToggle = ({ formData, onToggle, loading, isTop, editMode }) => {
  return (
    <>
      <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!formData.makeSupervisor}
            onChange={onToggle("makeSupervisor")}
            disabled={loading}
          />
          <span>Make Supervisor of selected department(s)</span>
        </label>
        <small className={styles.hint}>
          {isTop
            ? "Top-4: Check to add as Supervisor only (no Head). Leave unchecked to make them Head (and Supervisor)."
            : "Non-Top: Leader roles auto-enable here by policy; you can also tick to force supervisor for other roles you’re allowed to create."}
        </small>
      </div>

      {isTop && !editMode && (
        <div className={styles.note} style={{ gridColumn: "1 / -1" }}>
          By default (unchecked), Top-4 creation makes the user <b>Head</b> (and Supervisor) of selected departments.
        </div>
      )}
    </>
  );
};

export default GovernanceToggle;
