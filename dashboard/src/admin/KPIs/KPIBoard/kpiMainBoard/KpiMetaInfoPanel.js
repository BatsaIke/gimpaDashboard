// src/components/KPIBoard/KpiBoard/KpiMetaInfoPanel.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faUser,
  faCalendarAlt,
  faFlag,
  faUsers,
  faUserShield,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import AssigneeList from './AssigneeList';
import styles from './KpiMetaInfoPanel.module.css';

const KpiMetaInfoPanel = ({
  kpi,
  isCreatorView = false,
  isAssignedUser = false,
}) => {
  const getUniquePriorities = () =>
    [...new Set(kpi.deliverables?.map((d) => d.priority).filter(Boolean))];

  const priorities = getUniquePriorities();

  const nextDeadline = kpi.deliverables?.reduce((closest, d) => {
    if (!d.timeline) return closest;
    const date = new Date(d.timeline);
    return !closest || date < closest ? date : closest;
  }, null);

  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return user;
    return user.fullName || user.email || user._id || 'Unknown';
  };

  return (
    <div className={styles.rightColInner}>
      {/* Project */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCircle} className={styles.icon} />
          Project
        </h4>
        <p className={styles.infoText}>{kpi.header?.name || '—'}</p>
      </div>

      {/* Assignees */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faUser} className={styles.icon} />
          Assignees
        </h4>
        {kpi.assignedUsers?.length > 0 ? (
          <AssigneeList
            assignees={kpi.assignedUsers}
            isCreatorView={isCreatorView}
            isAssignedUser={isAssignedUser}
          />
        ) : (
          <p className={styles.infoText}>—</p>
        )}
      </div>

      {/* Dates */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
          Dates
        </h4>
        <p className={styles.infoText}>
          Created: {kpi.createdAt ? new Date(kpi.createdAt).toLocaleDateString() : '—'}
        </p>
        <p className={styles.infoText}>
          Updated: {kpi.updatedAt ? new Date(kpi.updatedAt).toLocaleDateString() : '—'}
        </p>
        {nextDeadline && (
          <p className={styles.infoText}>
            Next Deadline: {nextDeadline.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Priority */}
      {priorities.length > 0 && (
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFlag} className={styles.icon} />
            Priority
          </h4>
          <div className={styles.priorityList}>
            {priorities.map((priority, idx) => (
              <span key={idx} className={styles.priorityItem}>
                {priority}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Departments */}
      {kpi.departments?.length > 0 && (
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUsers} className={styles.icon} />
            Departments
          </h4>
          <div className={styles.departmentList}>
            {kpi.departments.map((dept) => (
              <span key={dept._id} className={styles.departmentItem}>
                {dept.name || dept._id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Roles */}
      {kpi.assignedRoles?.length > 0 && (
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUserShield} className={styles.icon} />
            Assigned Roles
          </h4>
          <div className={styles.roleList}>
            {kpi.assignedRoles.map((role) => (
              <span key={role} className={styles.roleItem}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
 
      {/* Created By */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faUserEdit} className={styles.icon} />
          Created By
        </h4>
        <p className={styles.infoText}>
          {kpi.createdBy ? getUserDisplayName(kpi.createdBy) : '—'}
        </p>
      </div>
    </div>
  );
};

export default KpiMetaInfoPanel;
