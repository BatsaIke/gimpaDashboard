import React from "react";
import MeetingBookingModal from "../../../../Descrepancy/DiscrepancyDetailModal/MeetingBookingModal";

export const KpiMeetingModal = ({
  open,
  onClose,
  flagId,
  discrepancy,
  onSubmit
}) => {
  return (
    <MeetingBookingModal
    isOpen={open}
    onClose={onClose}
    discrepancy={discrepancy}
    onConfirm={onSubmit}
  />
  );
};
