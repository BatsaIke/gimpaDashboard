// src/components/KPIBoard/KPIDetails/DeliverablesList.jsx
import React from "react";
import DeliverableItem from "./Deliverables/DeliverableItem";
import styles from "./DeliverablesList.module.css";

const DeliverablesList = ({
  originalDeliverables,
  kpi,
  ALL_STATUSES,
  isKpiCreator,
  isAssignedUser,
  onDeliverableStatusChange,
  onScoreChange,
  isUserView,
  reviewTargetUserId          // ← new prop
}) => {
  return (
    <div className={styles.deliverablesContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Deliverables</h3>
        <span className={styles.countBadge}>{kpi.deliverables.length}</span>
      </div>

      {kpi.deliverables.length > 0 ? (
        <div className={styles.deliverablesList}>
          {kpi.deliverables.map((del, idx) => {
            const originalStatus = originalDeliverables[idx]?.status || "Pending";
            const hasStatusChanged = del.status !== originalStatus;

            return (
              <DeliverableItem
                key={idx}
                index={idx}
                deliverable={del}
                kpi={kpi}
                hasStatusChanged={hasStatusChanged}
                isKpiCreator={isKpiCreator}
                isAssignedUser={isAssignedUser}
                ALL_STATUSES={ALL_STATUSES}
                onDeliverableStatusChange={onDeliverableStatusChange}
                onScoreChange={onScoreChange}
                isUserView={isUserView}
                reviewTargetUserId={reviewTargetUserId}  
              />
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyState}>No deliverables added yet</p>
      )}
    </div>
  );
};

export default DeliverablesList;
