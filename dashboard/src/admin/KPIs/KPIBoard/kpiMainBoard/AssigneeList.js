// src/components/KPIBoard/KpiBoard/AssigneeList.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './KpiMetaInfoPanel.module.css';

const AssigneeList = ({ assignees, isCreatorView }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleAssignees = showAll ? assignees : assignees.slice(0, 5);

  const getUserDisplayName = (user) => {
    if (!user) return "Unknown";
    if (typeof user === 'string') return user;
    return user.fullName || user.email || user._id || "Unknown";
  };

  return (
    <div className={styles.assigneeContainer}>
      <ul className={`${styles.assigneeList} ${showAll ? styles.expanded : ''}`}>
        {visibleAssignees.map((user) => {
          const displayName = getUserDisplayName(user);
          const email = user.email || displayName;

          return (
            <li key={user._id} className={styles.assigneeItem}>
              {isCreatorView ? (
                <Link
                  to={`/admin/user-kpis/${user._id}/${encodeURIComponent(email)}`}
                  className={styles.infoTextLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {email}
                 
                </Link>
              ) : (
                <span className={styles.infoTextLink}>
                  {email}
                  {user.role && (
                    <span className={styles.userRole}> ({user.role})</span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {assignees.length > 5 && (
        <button
          className={styles.loadMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `+${assignees.length - 5} More`}
        </button>
      )}
    </div>
  );
};

export default AssigneeList;
