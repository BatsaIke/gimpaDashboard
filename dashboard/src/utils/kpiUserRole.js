// utils/kpiUserRole.js
export const getKpiUserRole = (kpi, currentUser) => {
  const currentUserId = currentUser?._id;
  
  const creatorId =
    typeof kpi?.createdBy === "object" ? kpi?.createdBy?._id : kpi?.createdBy;
  const isCreator = String(creatorId) === String(currentUserId);
  
  const currentUserRole = currentUser?.role;
  const currentUserDepartment = currentUser?.department;
  
  const isAssignedUser =
    kpi?.assignedUsers?.some(
      (user) => String(user._id || user) === String(currentUserId)
    ) ||
    (kpi?.assignedRoles || []).includes(currentUserRole) ||
    kpi?.departments?.some(
      (dept) => String(dept._id || dept) === String(currentUserDepartment)
    );
  
  return { isCreator, isAssignedUser };
};
