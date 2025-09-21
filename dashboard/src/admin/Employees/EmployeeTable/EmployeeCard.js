import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./EmployeeCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faBuilding, faEye,  } from "@fortawesome/free-solid-svg-icons";

const EmployeeCard = ({ employee, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const uname = employee.fullName || employee.username || employee.email || "User";
  const initial = String(uname).charAt(0).toUpperCase();

  return (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <motion.div 
        className={styles.cardHeader}
        onClick={() => onView(employee)}
        whileHover={{ background: "linear-gradient(135deg, #0c4335 0%, #0b2a40 80%)" }}
      >
        <motion.div 
          className={styles.avatar}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {initial}
        </motion.div>
        <div className={styles.titleContainer}>
          <h3 title={uname}>{uname}</h3>
          <span className={styles.roleBadge}>{employee.rank || employee.role || "—"}</span>
        </div>
        <motion.div
          className={styles.viewButton}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faEye} />
        </motion.div>
      </motion.div>

      {/* Body Section */}
      <motion.div 
        className={styles.cardBody}
        onClick={() => onView(employee)}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
          <span>{employee.email || "No email"}</span>
        </div>
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faPhone} className={styles.icon} />
          <span>{employee.phone || "No phone"}</span>
        </div>
        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faBuilding} className={styles.icon} />
          <span>
            {employee?._dep?.name ??
              (typeof employee?.department === "object"
                ? employee.department?.name
                : employee?.department) ??
              "No department"}
          </span>
        </div>
      </motion.div>

     
      {/* Hover Glow Effect */}
      <motion.div 
        className={styles.glowEffect}
        animate={{ 
          opacity: isHovered ? 0.3 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default EmployeeCard;