import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChevronDown,
  faUserCircle,
  faBars,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>Syst</div>

        <div className={styles.rightSection}>
          <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />

          <div
            className={`${styles.userSection} ${
              isDropdownOpen ? styles.isDropdownOpen : ""
            }`}
            ref={dropdownRef}
            onClick={toggleDropdown}
          >
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user?.fullName || user?.username}
              </div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className={styles.arrowIcon} />
            
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className={styles.dropdownIcon} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <FontAwesomeIcon
            icon={faBars}
            className={styles.mobileMenuIcon}
            onClick={toggleMobileMenu}
          />
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </>
  );
};

export default Header;