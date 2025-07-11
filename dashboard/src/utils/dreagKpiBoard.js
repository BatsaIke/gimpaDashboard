export const canUserMoveKpi = (kpi, destinationStatus) => {
  // Use the pre-computed values from the KPI object
  if (kpi.isCreator) return true;
  
  if (kpi.isAssignedUser) {
    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    return allowedStatuses.includes(destinationStatus);
  }

  return false;
};