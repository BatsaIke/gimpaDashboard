// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUserEdit, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import * as FaIcons from "react-icons/fa";
import styles from "./Sidebar.module.css";

import { logout } from "../../actions/authAction";
import { fetchDepartments } from "../../actions/departmentsActions";
import { getMenusForUser } from "./SidebarMenus";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((s) => s.auth?.user); // { _id, role, ... }
  const [departments, setDepartments] = useState([]);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // minimal fetch so we can check supervisor/head status client-side
    const load = async () => {
      const res = await dispatch(fetchDepartments());
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    };
    load();
  }, [dispatch]);

  const menus = getMenusForUser(authUser, departments);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", { detail: { isCollapsed: newState } })
    );
  };

  return (
    <motion.div
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.logoContainer}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {!isCollapsed && <h2 className={styles.logoText}>KPI Portal</h2>}
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </motion.div>

      <nav className={styles.navMenu}>
        {menus.map((menu, index) => {
          const Icon = FaIcons[menu.icon];
          return (
            <motion.div
              key={menu.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavLink
                to={menu.path}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.menuItem} ${styles.activeMenuItem}`
                    : styles.menuItem
                }
                title={isCollapsed ? menu.name : ""}
              >
                <span className={styles.menuIcon}>{Icon && <Icon />}</span>
                {!isCollapsed && (
                  <span className={styles.menuText}>{menu.name}</span>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        className={styles.bottomMenu}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <NavLink
          to="/admin/profile"
          className={styles.menuItem}
          title={isCollapsed ? "Profile" : ""}
        >
          <span className={styles.menuIcon}>
            <FaUserEdit />
          </span>
          {!isCollapsed && <span className={styles.menuText}>Profile</span>}
        </NavLink>
        <div
          className={styles.menuItem}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className={styles.menuIcon}>
            <FaSignOutAlt />
          </span>
          {!isCollapsed && <span className={styles.menuText}>Logout</span>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;