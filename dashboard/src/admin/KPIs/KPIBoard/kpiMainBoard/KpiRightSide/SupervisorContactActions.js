// src/components/KPIBoard/KpiBoard/SupervisorContactActions.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import styles from "./SupervisorContactActions.module.css";

const pickPhone = (u = {}) =>
  u.phone || u.mobile || u.whatsapp || u.contact?.phone || "";

const SupervisorContactActions = ({ supervisor }) => {
  if (!supervisor) return null;

  const phone = String(pickPhone(supervisor) || "").trim();
  const email = String(supervisor.email || "").trim();

  const waNumber = phone.replace(/\D/g, ""); // sanitize for wa.me

  const hasPhone = Boolean(waNumber);
  const hasEmail = Boolean(email);

  if (!hasPhone && !hasEmail) return null;

  return (
    <div className={styles.actions}>
      {hasPhone && (
        <a href={`tel:${phone}`} className={styles.actionBtn} title="Call">
          <FontAwesomeIcon icon={faPhone} /> Call
        </a>
      )}

      {hasPhone && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.actionBtn} ${styles.whatsappBtn}`}
          title="WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
        </a>
      )}

      {hasEmail && (
        <a
          href={`mailto:${email}`}
          className={`${styles.actionBtn} ${styles.emailBtn}`}
          title="Email"
        >
          <FontAwesomeIcon icon={faEnvelope} /> Email
        </a>
      )}
    </div>
  );
};

export default SupervisorContactActions;
