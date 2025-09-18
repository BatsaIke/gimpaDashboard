import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./StatCard.module.css";

const StatCard = ({ title, value, change, icon, color }) => {
  const positive = change >= 0;

  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        <FontAwesomeIcon icon={icon} />
      </div>

      <div className={styles.statContent}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.statValue}>{value}</p>

        <div className={`${styles.statChange} ${positive ? styles.positive : styles.negative}`}>
          <FontAwesomeIcon icon={positive ? faArrowUp : faArrowDown} />
          <span>{Math.abs(change)}% from last week</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
