import React from "react";
import CenteredTaskModal from "../../../../../UI/modal/CenteredTaskModal";
import KpiDetailLeftPanel from "../KpiDetailModal/KpiDetailLeftPanel";
import KpiMetaInfoPanel from "../../kpiMainBoard/KpiMetaInfoPanel";

export const KpiDetailContent = ({
  isOpen,
  onClose,
  localKpi,
  origDels,
  ALL_STATUSES,
  isCreator,
  isAssignedUser,
  isUserView,
  handleKpiStatusChange,
  handleDeliverableStatusChange,
  handleAttachChange,
  handleScoreChange,
  handleSave,
  handleCancel,
  onBookMeeting,
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
        isUserView={isUserView}
        handleKpiStatusChange={handleKpiStatusChange}
        handleDeliverableStatusChange={handleDeliverableStatusChange}
        handleAttachChange={handleAttachChange}
        handleScoreChange={handleScoreChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        onBookMeeting={onBookMeeting}
        saving={saving}
      />
    }
    rightContent={
      <KpiMetaInfoPanel kpi={localKpi} isCreatorView={isCreator} />
    }
  />
);
