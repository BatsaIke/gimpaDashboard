import React from "react";
import styles from "./ProfilePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdBadge, faUserTie } from "@fortawesome/free-solid-svg-icons";

const ProfileHero = ({ name, role, rank }) => {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={`${styles.hero} ${styles.glass}`}>
      <div className={styles.avatar}>{initials}</div>
      <div className={styles.heroText}>
        <h1 className={styles.name}>{name}</h1>
        <div className={styles.pills}>
          {role && (
            <span className={`${styles.pill} ${styles.glassSoft}`}>
              <FontAwesomeIcon icon={faUserTie} /> {role}
            </span>
          )}
          {rank && (
            <span className={`${styles.pill} ${styles.glassSoft}`}>
              <FontAwesomeIcon icon={faIdBadge} /> {rank}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProfileHero;
