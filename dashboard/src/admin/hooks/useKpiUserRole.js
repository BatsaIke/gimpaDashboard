import { useSelector } from "react-redux";

export const useKpiUserRole = (kpi) => {
  const currentUser = useSelector((state) => state.auth?.user);
  const currentUserId = currentUser?._id;

  // Handle both string and object createdBy cases
  const creatorId = 
    typeof kpi?.createdBy === 'object' 
      ? kpi?.createdBy?._id 
      : kpi?.createdBy;

  // More robust comparison
  const isCreator = String(creatorId) === String(currentUserId);
  
 

  const currentUserRole = currentUser?.role;
  const currentUserDepartment = currentUser?.department;

  const isAssignedUser =
    kpi?.assignedUsers?.some((user) => String(user._id) === String(currentUserId)) ||
    (kpi?.assignedRoles || []).includes(currentUserRole) ||
    kpi?.departments?.some((dept) => String(dept._id) === String(currentUserDepartment));

  return { isCreator, isAssignedUser };
};