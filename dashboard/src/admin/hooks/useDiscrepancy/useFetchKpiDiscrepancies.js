// src/hooks/discrepancies/useFetchKpiDiscrepancies.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDiscrepancies } from "../../../actions/discrepancyActions";

export default function useFetchKpiDiscrepancies(kpiId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!kpiId) return;
    dispatch(fetchDiscrepancies(kpiId))
      .then((res) => console.log(`[useFetchKpiDiscrepancies] KPI ${kpiId}:`, res))
      .catch((err) => console.error(`[useFetchKpiDiscrepancies] KPI ${kpiId} failed:`, err));
  }, [dispatch, kpiId]);
}
