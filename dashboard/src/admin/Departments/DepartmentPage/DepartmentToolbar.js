import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBuilding, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "./DepartmentPage.module.css";

const DepartmentToolbar = ({
  isTop,
  count = 0,
  searchTerm = "",
  setSearchTerm,
  categories = [],
  filterCategory = "All",
  setFilterCategory,
  onAddClick,
  onAddRoleClick, // optional
}) => {
  const cats = categories && categories.length ? categories : ["All"];

  return (
    <div className={styles.pageHeader}>
      <div className={styles.headerContent}>
        <motion.div
          className={styles.titleSection}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FontAwesomeIcon icon={faBuilding} className={styles.titleIcon} />
          <h1>Faculties &amp; Units</h1>
          <span className={styles.countBadge}>{count} departments</span>
        </motion.div>

        <div className={styles.buttonRow}>
          <motion.button
            onClick={onAddClick}
            className={styles.addButton}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faPlus} />
            {isTop ? "Add Faculty/Unit" : "Add Sub-Department"}
          </motion.button>

          {onAddRoleClick && (
            <motion.button
              onClick={onAddRoleClick}
              className={styles.addRoleButton}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Create a role and attach it to a department"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Role
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        className={styles.controls}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBox}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory?.(e.target.value)}
            className={styles.filterSelect}
          >
            {cats.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    </div>
  );
};

export default DepartmentToolbar;
