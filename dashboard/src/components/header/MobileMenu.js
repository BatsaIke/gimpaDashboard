import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, 
  faEnvelope, 
  faBook,
  faHome,
  faBox,
  faClipboardList,
  faChartBar
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MobileMenu.module.css";

const MobileMenu = ({ isOpen, onClose, onContactNavigate, onInstructionsNavigate }) => {
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
          <FontAwesomeIcon icon={faHome} className={styles.menuIcon} />
          <span>Home</span>
        </Link>
        
        <Link to="/admin/products" className={styles.menuItem} onClick={onClose}>
          <FontAwesomeIcon icon={faBox} className={styles.menuIcon} />
          <span>Products</span>
        </Link>
        
        <Link to="/admin/orders" className={styles.menuItem} onClick={onClose}>
          <FontAwesomeIcon icon={faClipboardList} className={styles.menuIcon} />
          <span>Orders</span>
        </Link>
        
        <Link to="/admin/report" className={styles.menuItem} onClick={onClose}>
          <FontAwesomeIcon icon={faChartBar} className={styles.menuIcon} />
          <span>Reports</span>
        </Link>
        
        {/* New Contact and Instructions Links */}
        <button className={styles.menuItem} onClick={() => { onContactNavigate(); onClose(); }}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.menuIcon} />
          <span>Contact</span>
        </button>
        
        <button className={styles.menuItem} onClick={() => { onInstructionsNavigate(); onClose(); }}>
          <FontAwesomeIcon icon={faBook} className={styles.menuIcon} />
          <span>Instructions</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileMenu;