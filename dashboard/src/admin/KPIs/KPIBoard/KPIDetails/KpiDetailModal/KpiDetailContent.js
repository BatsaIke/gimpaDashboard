import React from "react";
import CenteredTaskModal from "../../../../../UI/modal/CenteredTaskModal";
import KpiDetailLeftPanel from "../KpiDetailModal/KpiDetailLeftPanel";
import KpiMetaInfoPanel from "../../kpiMainBoard/KpiRightSide/KpiMetaInfoPanel";

export const KpiDetailContent = ({
  isOpen,
  localKpi,
  origDels,
  ALL_STATUSES,
  isCreator,
  isAssignedUser,
  isUserView,
  handleKpiStatusChange,
  viewedUserId,
  handleDeliverableStatusChange,
  // handleAttachChange,
  handleScoreChange,
  handleSave,
  handleCancel,
  saving
}) => (
  <CenteredTaskModal
    isOpen={isOpen}
    onClose={handleCancel}
    header="KPI Details"
    leftContent={
      <KpiDetailLeftPanel
        localKpi={localKpi}
        origDels={origDels}
        ALL_STATUSES={ALL_STATUSES}
        isCreator={isCreator}
        isAssignedUser={isAssignedUser}
        viewedUserId={viewedUserId}
        isUserView={isUserView}
        handleKpiStatusChange={handleKpiStatusChange}
        handleDeliverableStatusChange={handleDeliverableStatusChange}
        handleScoreChange={handleScoreChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        saving={saving}
      />
    }
    rightContent={
      <KpiMetaInfoPanel kpi={localKpi} isCreatorView={isCreator} />
    }
  />
);
