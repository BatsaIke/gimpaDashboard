// OccurrencePicker.jsx
import React from "react";
import styles from "./OccurrencePicker.module.css";

const OccurrencePicker = ({ occurrences = [], value, onChange, disabled }) => {
  const opts = (occurrences || []).map((o) => ({
    value: o?.periodLabel,
    text: o?.periodLabel || "(unlabeled)",
  }));

  return (
    <div className={styles.pickerRow}>
      <label className={styles.label}>Pick an occurrence</label>
      <select
        className={styles.select}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value || null)}
        disabled={disabled}
      >
        <option value="" disabled>
          Select…
        </option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OccurrencePicker;
