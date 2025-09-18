import React from "react";
import styles from "./ProfilePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

const ProfileCard = ({ username, fullName, email, phone }) => {
  return (
    <section className={`${styles.card} ${styles.glass}`}>
      <h2 className={styles.cardTitle}>
        <FontAwesomeIcon icon={faBriefcase} /> Profile
      </h2>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Username</span>
          <span className={styles.fieldValue}>{username || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Full Name</span>
          <span className={styles.fieldValue}>{fullName || "—"}</span>
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            <FontAwesomeIcon icon={faEnvelope} /> Email
          </span>
          <span className={styles.fieldValue}>{email || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>
            <FontAwesomeIcon icon={faPhone} /> Phone
          </span>
          <span className={styles.fieldValue}>{phone || "—"}</span>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
