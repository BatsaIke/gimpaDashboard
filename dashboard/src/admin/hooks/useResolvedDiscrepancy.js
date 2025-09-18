// src/hooks/discrepancies/useResolvedDiscrepancy.js
import { useSelector } from "react-redux";

const DIFF_THRESHOLD = 10;

function getLatestOccurrence(deliverable) {
  const occ = Array.isArray(deliverable?.occurrences) ? deliverable.occurrences : [];
  if (!occ.length) return null;
  return occ[occ.length - 1];
}

function computeLocalDiscrepancy(d) {
  if (!d?.isRecurring) {
    const a = d?.assigneeScore?.value;
    const c = d?.creatorScore?.value;
    if (typeof a === "number" && typeof c === "number") {
      const diff = Math.abs(a - c);
      if (diff > DIFF_THRESHOLD) {
        return {
          deliverableIndex: d?.index,
          deliverableId: d?._id,
          resolved: false,
          meetingBooked: false,
          reason: "Score discrepancy detected",
          resolutionNotes: "",
          meta: { type: "single", assigneeScore: a, creatorScore: c, difference: diff },
        };
      }
    }
    return null;
  }

  const latest = getLatestOccurrence(d);
  if (latest?.assigneeScore?.value != null && latest?.creatorScore?.value != null) {
    const a = latest.assigneeScore.value;
    const c = latest.creatorScore.value;
    const diff = Math.abs(a - c);
    if (diff > DIFF_THRESHOLD) {
      return {
        deliverableIndex: d?.index,
        deliverableId: d?._id,
        resolved: false,
        meetingBooked: false,
        reason: "Score discrepancy detected",
        resolutionNotes: "",
        meta: {
          type: "occurrence",
          periodLabel: latest?.periodLabel,
          assigneeScore: a,
          creatorScore: c,
          difference: diff,
        },
      };
    }
  }
  return null;
}

function selectKpiDiscrepancyForDeliverable(state, kpiId, deliverable, selectedPeriodLabel) {
  const base = state?.discrepancies || {};
  const byKpi = base.byKpi?.[kpiId];
  let candidates = [];

  // Collect all potential flags
  if (byKpi?.byDeliverable && deliverable?._id) {
    const found = byKpi.byDeliverable[deliverable._id];
    if (found) candidates.push(found);
  }
  if (Array.isArray(byKpi?.list)) candidates = candidates.concat(byKpi.list);
  if (Array.isArray(base.items)) candidates = candidates.concat(base.items);

  const period = selectedPeriodLabel || getLatestOccurrence(deliverable)?.periodLabel;
  const delIndex = deliverable?.index ?? deliverable?.deliverableIndex;

  const match = candidates.find((f) => {
    if (!f) return false;

    // Match by index if provided
    const indexMatch =
      f.deliverableIndex != null
        ? String(f.deliverableIndex) === String(delIndex)
        : f.delIndex != null
        ? String(f.delIndex) === String(delIndex)
        : false;

    // Fallback to ID match
    const idMatch =
      f.deliverableId === deliverable?._id ||
      f.deliverable?._id === deliverable?._id;

    if (!indexMatch && !idMatch) return false;

    // For recurring, also match periodLabel
    if (period && (f.periodLabel || f.meta?.periodLabel)) {
      return (f.periodLabel || f.meta?.periodLabel) === period;
    }
    return true;
  });

  return match || null;
}

export default function useResolvedDiscrepancy(kpiId, deliverable, selectedPeriodLabel) {
  const backendDiscrepancy = useSelector((s) =>
    selectKpiDiscrepancyForDeliverable(s, kpiId, deliverable, selectedPeriodLabel)
  );
  
  // If we have a backend discrepancy, merge it with any local computed values
  if (backendDiscrepancy) {
    return {
      ...computeLocalDiscrepancy(deliverable),
      ...backendDiscrepancy,
      meetingBooked: backendDiscrepancy.meetingBooked || !!backendDiscrepancy.meeting
    };
  }
  
  return computeLocalDiscrepancy(deliverable);
}