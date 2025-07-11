import { Types } from "mongoose";

type LeanKpi = {
  _id: Types.ObjectId | string;
  createdBy: { _id: Types.ObjectId | string } | Types.ObjectId | string;
  assignedUsers: ({ _id: Types.ObjectId | string } | Types.ObjectId | string)[];
  assignedRoles: string[];
  departments: ({ _id: Types.ObjectId | string } | Types.ObjectId | string)[];
};

export const calculateKpiPermissions = (
  kpi: LeanKpi,
  currentUserId: Types.ObjectId | string,
  currentUserRole: string,
  currentUserDepartment?: Types.ObjectId | string | null
) => {
  const userIdStr = String(currentUserId);

  const isCreator =
    typeof kpi.createdBy === "object"
      ? String((kpi.createdBy as any)._id) === userIdStr
      : String(kpi.createdBy) === userIdStr;

  const isAssignedUser =
    kpi.assignedUsers.some((user) =>
      typeof user === "object"
        ? String((user as any)._id) === userIdStr
        : String(user) === userIdStr
    ) ||
    kpi.assignedRoles.includes(currentUserRole) ||
    (currentUserDepartment &&
      kpi.departments.some((dep) =>
        typeof dep === "object"
          ? String((dep as any)._id) === String(currentUserDepartment)
          : String(dep) === String(currentUserDepartment)
      ));

  return { isCreator, isAssignedUser };
};
