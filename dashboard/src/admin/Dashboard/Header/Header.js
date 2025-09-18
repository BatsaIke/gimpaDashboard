import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass as faSearch, // v6 alias
  faBell,
  faEnvelope,
  faCircleUser as faUserCircle, // v6 alias
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";

const Header = ({ toggleSidebar, user }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuToggle} onClick={toggleSidebar} aria-label="Open sidebar">
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className={styles.headerRight}>
        <button className={styles.notificationBtn} aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        <button className={styles.messageBtn} aria-label="Messages">
          <FontAwesomeIcon icon={faEnvelope} />
          <span className={styles.messageBadge}>5</span>
        </button>

        <div className={styles.userProfile}>
          <FontAwesomeIcon icon={faUserCircle} className={styles.userAvatar} />
          <span className={styles.userName}>{user.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
