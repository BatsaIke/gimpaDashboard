import React, { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faUsers,
  faUserTie,
  faCalendarAlt,
  faChartLine,
  faHourglassHalf,
  faSpinner,
  faCheckCircle,
  faAward
} from "@fortawesome/free-solid-svg-icons";
import styles from "./KpiCard.module.css";

const statusColorMap = {
  Pending: "#EF4444",
  "In Progress": "#F59E0B",
  Completed: "#3B82F6",
  Approved: "#10B981",
};

const statusIconMap = {
  Pending: faHourglassHalf,
  "In Progress": faSpinner,
  Completed: faCheckCircle,
  Approved: faAward,
};

/** Truncate by words (keeps layout stable). */
const truncateWords = (str = "", maxWords = 24) => {
  const parts = String(str).trim().split(/\s+/);
  if (parts.length <= maxWords) return str;
  return parts.slice(0, maxWords).join(" ") + "…";
};

const KpiActions = ({ onEdit, onDelete, isUserView }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.actionsWrapper}>
      {!isUserView && (
        <>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={styles.threeDots}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <FiMoreVertical size={18} />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.actionsMenu}
              >
                <button
                  className={styles.actionItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button
                  className={styles.actionItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

const KpiCardContent = ({
  kpi,
  isCreator,
  isAssignedUser,
  isUserView,
  onEditKpi,
  onDeleteKpi,
}) => {
  const statusColor = statusColorMap[kpi.status] || "#6B7280";

  // pre-truncate description text (fast + stable)
  const shortDesc = useMemo(
    () => truncateWords(kpi?.description ?? "", 24), // adjust count if needed
    [kpi?.description]
  );

  return (
    <motion.div className={styles.card} whileHover={{ y: -4 }}>
      <div className={styles.cardHeader} style={{ background: statusColor }}>
        <div className={styles.statusIcon}>
          <FontAwesomeIcon
            icon={statusIconMap[kpi.status]}
            className={styles.headerIcon}
          />
        </div>
        <div className={styles.titleContainer}>
          <h3>{kpi.name}</h3>
          <span className={styles.statusText}>{kpi.status}</span>
        </div>

        {isCreator && (
          <KpiActions
            onEdit={() => onEditKpi(kpi)}
            onDelete={() => onDeleteKpi(kpi._id)}
            isUserView={isUserView}
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.kpiDescription}>
          <FontAwesomeIcon icon={faClipboardCheck} className={styles.icon} />
          {/* clamp words + visually clamp to lines */}
          <p className={`${styles.descClamp}`}>{shortDesc}</p>
        </div>

        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faUsers} className={styles.icon} />
          <div>
            <span className={styles.infoLabel}>Departments: </span>
            <span className={styles.infoLabel}>
              {kpi.departments?.length
                ? `${kpi.departments.length} department(s)`
                : "None"}
            </span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <FontAwesomeIcon icon={faUserTie} className={styles.icon} />
          <div>
            <span className={styles.infoLabel}>Assigned to: </span>
            <span className={styles.infoLabel}>
              {kpi.assignedUsers?.length
                ? `${kpi.assignedUsers.length} user(s)`
                : "None"}
            </span>
          </div>
        </div>

        {kpi.dueDate && (
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <div>
              <span className={styles.infoLabel}>Due Date: </span>
              <span>{new Date(kpi.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {kpi.targetValue && (
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faChartLine} className={styles.icon} />
            <div>
              <span className={styles.infoLabel}>Target: </span>
              <span>{kpi.targetValue}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(KpiCardContent);
