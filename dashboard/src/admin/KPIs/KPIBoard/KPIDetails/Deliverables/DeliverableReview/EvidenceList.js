// EvidenceList.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./DeliverableReview.module.css";

const EvidenceList = ({ urls = [] }) => {
  if (!Array.isArray(urls) || urls.length === 0) {
    return <p className={styles.noEvidence}>— none uploaded —</p>;
  }

  return (
    <ul className={styles.fileList}>
      {urls.map((u, i) => (
        <li key={`${u}-${i}`}>
          <FontAwesomeIcon icon={faFileAlt} />{" "}
          <a href={u} target="_blank" rel="noopener noreferrer">
            {String(u).split("/").pop()}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default EvidenceList;
