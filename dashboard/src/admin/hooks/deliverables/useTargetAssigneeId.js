// src/hooks/kpi/useTargetAssigneeId.js
import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useTargetAssigneeId({ isCreator, isUserView, kpi, reviewTargetUserId }) {
  const authUser = useSelector((s) => s.auth.user);
  const selectedAssigneeId = useSelector((s) => s.kpis?.ui?.selectedAssigneeId);

  const targetAssigneeId = useMemo(() => {
    if (isCreator && isUserView) {
      return reviewTargetUserId || kpi?.viewedUserId || selectedAssigneeId || null;
    }
    return authUser?._id || null;
  }, [isCreator, isUserView, reviewTargetUserId, kpi?.viewedUserId, selectedAssigneeId, authUser?._id]);

  return targetAssigneeId;
}
