import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "./MobileMenu.module.css";

const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
      {/* Close Icon */}
      <button className={styles.closeButton} onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>

      {/* Navigation Links */}
      <nav className={styles.menuContent}>
  {/* Menu Header */}
  <h2 className={styles.menuHeader}>Admin Menu</h2>

  {/* Navigation Links */}
  <Link to="/" className={styles.menuItem} onClick={onClose}>
    Home
  </Link>
  <Link to="/admin/products" className={styles.menuItem} onClick={onClose}>
    Products
  </Link>
  <Link to="/admin/orders" className={styles.menuItem} onClick={onClose}>
    Orders
  </Link>
  <Link to="/admin/report" className={styles.menuItem} onClick={onClose}>
    Reports
  </Link>
</nav>

    </div>
  );
};

export default MobileMenu;
