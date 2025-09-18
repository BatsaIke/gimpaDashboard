import React from "react";
import { FiSearch } from "react-icons/fi";
import styles from "./KpiSearchBar.module.css";

const KpiSearchBar = ({ value, onChange }) => (
  <div className={styles.wrapper}>
    <FiSearch className={styles.icon} />
    <input
      type="text"
      placeholder="Search headers or KPIs…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.input}
      aria-label="Search headers or KPIs"
    />
  </div>
);

export default KpiSearchBar;