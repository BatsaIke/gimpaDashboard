// src/components/KPIBoard/KpiBoard/KpiMetaInfoPanel.js
import React from 'react';
import { useSelector } from 'react-redux';
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
import AssigneeList from '../AssigneeList';
import styles from './KpiMetaInfoPanel.module.css';
import SupervisorContactActions from './SupervisorContactActions';

const getId = (u) => (typeof u === 'string' ? u : u?._id);
const getUserDisplayName = (user) => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  return user.fullName || user.username || user.email || user._id || 'Unknown';
};

const findAssigneeById = (assignedUsers = [], id) => {
  if (!id) return null;
  // assignedUsers can be ObjectIds (strings) or populated user objects
  return (
    assignedUsers.find((u) => getId(u) === id) ||
    null
  );
};

const KpiMetaInfoPanel = ({
  kpi,
  isCreatorView = false,
  isAssignedUser = false,
  // 👇 Pass this when you’re on another user’s board (e.g., UserKpiBoard, KpiDetailModal)
  viewedUserId, // optional: the assignee whose KPIs are being viewed
}) => {
  const authUser = useSelector((s) => s.auth.user);

  const priorities = [...new Set(kpi.deliverables?.map((d) => d.priority).filter(Boolean))];

  const nextDeadline = kpi.deliverables?.reduce((closest, d) => {
    if (!d.timeline) return closest;
    const date = new Date(d.timeline);
    return !closest || date < closest ? date : closest;
  }, null);

  const creatorUserId = getId(kpi.createdBy);
  const isSupervisorSelf = authUser?._id && creatorUserId && authUser._id === creatorUserId;

  // If creator is viewing someone else’s board, surface THAT assignee’s contact
  const viewedAssignee =
    viewedUserId && viewedUserId !== authUser?._id
      ? findAssigneeById(kpi.assignedUsers, viewedUserId)
      : null;

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

      {/* Assignees — creator only */}
      {isCreatorView && (
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
      )}

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
          <p className={styles.infoText}>Next Deadline: {nextDeadline.toLocaleDateString()}</p>
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

      {/* Supervisor */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faUserEdit} className={styles.icon} />
          Supervisor
        </h4>
        <p className={styles.infoText}>
          {kpi.createdBy ? getUserDisplayName(kpi.createdBy) : '—'}
        </p>

        {/* Show supervisor contact ONLY if viewer is NOT the supervisor */}
        {!isSupervisorSelf &&
          kpi.createdBy &&
          typeof kpi.createdBy === 'object' && (
            <SupervisorContactActions supervisor={kpi.createdBy} />
          )}
      </div>

      {/* If I am the supervisor viewing an assignee's board → show the assignee contact */}
      {isSupervisorSelf && viewedAssignee && (
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            Assignee
          </h4>
          <p className={styles.infoText}>{getUserDisplayName(viewedAssignee)}</p>
          <SupervisorContactActions supervisor={viewedAssignee} />
        </div>
      )}
    </div>
  );
};

export default KpiMetaInfoPanel;
