// src/components/KPIBoard/KPIDetails/KpiDetailLeftPanel.js
import React from "react";
import styles from "./KpiDetailModal.module.css";
import DeliverablesList from "../DeliverablesList";
import KpiMainFields from "../KpiMainFields";

const KpiDetailLeftPanel = ({
  localKpi,
  origDels,
  ALL_STATUSES,
  isCreator,
  isAssignedUser,
  isUserView,
  handleKpiStatusChange,
  handleDeliverableStatusChange,
  handleScoreChange,
  handleSave,
  handleCancel,
  saving,
  viewedUserId
}) => (
  <div className={styles.leftColInner}>
    <KpiMainFields
      localKpi={localKpi}
      onStatusChange={handleKpiStatusChange}
      ALL_STATUSES={ALL_STATUSES}
      isKpiCreator={isCreator}
      isAssignedUser={isAssignedUser}
    />

    {localKpi.deliverables?.length ? (
      <DeliverablesList
        deliverables={localKpi.deliverables}
        originalDeliverables={origDels}
        kpi={localKpi}
        ALL_STATUSES={ALL_STATUSES}
        isKpiCreator={isCreator}
        isAssignedUser={isAssignedUser}
        isUserView={isUserView}
        onDeliverableStatusChange={handleDeliverableStatusChange}
        onScoreChange={handleScoreChange}
       reviewTargetUserId={viewedUserId}
      />
    ) : (
      <p className={styles.noDeliverables}>No deliverables added yet</p>
    )}

    <div className={styles.footerActions}>
      <button
        className={styles.cancelButton}
        onClick={handleCancel}
      >
        Cancel
      </button>
      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={saving || (!isCreator && !isAssignedUser)}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  </div>
);

export default KpiDetailLeftPanel;
