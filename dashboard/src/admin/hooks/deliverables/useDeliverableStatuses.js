// src/hooks/deliverables/useDeliverableStatuses.js
export default function useDeliverableStatuses({
  isCreator,
  isUserView,
  isAssignedUser,
  hasScore,
  currentStatus,
  ALL_STATUSES = [],
}) {
  const statuses = (() => {
    if (isCreator && isUserView) {
      return hasScore
        ? ["Pending", "In Progress", "Completed", "Approved"]
        : ["Pending", "In Progress"];
    }
    if (isAssignedUser) {
      return hasScore
        ? ["Pending", "In Progress", "Completed"]
        : ["Pending", "In Progress"];
    }
    if (isCreator) return ALL_STATUSES;
    return [currentStatus || "Pending"];
  })();

  return statuses;
}
