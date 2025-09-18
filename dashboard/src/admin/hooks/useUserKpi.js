// src/hooks/kpi/useUserKpi.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserKpis } from "../../actions/kpiActions";
import { selectUserKpiById } from "../../utils/kpiSelectors";

export default function useUserKpi(targetAssigneeId, kpiId) {
  const dispatch = useDispatch();

  const userKpi = useSelector((s) =>
    targetAssigneeId && kpiId ? selectUserKpiById(s, targetAssigneeId, kpiId) : null
  );

  useEffect(() => {
    if (targetAssigneeId && kpiId && !userKpi) {
      dispatch(fetchUserKpis(targetAssigneeId));
    }
  }, [dispatch, targetAssigneeId, kpiId, userKpi]);

  return userKpi;
}
