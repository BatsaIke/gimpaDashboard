// src/hooks/discrepancies/useResolvedDiscrepancy.js
import { useSelector } from "react-redux";

const DIFF_THRESHOLD = 10;

function computeFromPair(a, c, meta = {}) {
  if (typeof a === "number" && typeof c === "number") {
    const difference = Math.abs(a - c);
    if (difference > DIFF_THRESHOLD) {
      return {
        resolved: false,
        meetingBooked: false,
        reason: "Score discrepancy detected",
        resolutionNotes: "",
        meta: { ...meta, assigneeScore: a, creatorScore: c, difference },
      };
    }
  }
  return null;
}

function selectBackendDiscrepancy(state, kpiId, deliverable, selectedPeriodLabel) {
  const deliverableId = deliverable?._id;
  const deliverableIndex = deliverable?.index ?? deliverable?.deliverableIndex;

  const base = state?.discrepancies || {};
  const byKpi = base.byKpi?.[kpiId];
  let pool = [];

  if (byKpi?.byDeliverable?.[deliverableId]) pool.push(byKpi.byDeliverable[deliverableId]);
  if (Array.isArray(byKpi?.list)) pool = pool.concat(byKpi.list);
  if (Array.isArray(base.items)) pool = pool.concat(base.items);

  return (
    pool.find((d) => {
      // ✅ Match by index (preferred in backend)
      const indexMatch =
        d?.deliverableIndex != null
          ? String(d.deliverableIndex) === String(deliverableIndex)
          : d?.delIndex != null
          ? String(d.delIndex) === String(deliverableIndex)
          : false;

      // ✅ Fallback to deliverableId match
      const idMatch =
        d?.deliverableId === deliverableId || d?.deliverable?._id === deliverableId;

      if (!indexMatch && !idMatch) return false;

      // ✅ For recurring, also match occurrence label if provided
      if (selectedPeriodLabel) {
        const p = d?.occurrenceLabel || d?.periodLabel || d?.meta?.periodLabel;
        return p ? p === selectedPeriodLabel : false;
      }
      return true;
    }) || null
  );
}

/**
 * kpiId: string
 * deliverable: object
 * selectedPeriodLabel?: string (for recurring deliverables)
 */
export default function useResolvedDiscrepancy(kpiId, deliverable, selectedPeriodLabel) {
  const backend = useSelector((s) =>
    selectBackendDiscrepancy(s, kpiId, deliverable, selectedPeriodLabel)
  );
  if (backend) return backend;

  // Fallback compute (respect selected occurrence if provided)
  if (deliverable?.isRecurring) {
    const occs = Array.isArray(deliverable.occurrences) ? deliverable.occurrences : [];
    const occ = selectedPeriodLabel
      ? occs.find((o) => o.periodLabel === selectedPeriodLabel)
      : occs[occs.length - 1];
    const a = occ?.assigneeScore?.value;
    const c = occ?.creatorScore?.value;
    const meta = { type: "occurrence", periodLabel: occ?.periodLabel };
    const local = computeFromPair(a, c, meta);
    return local ? { ...local, deliverableIndex: deliverable?.index, deliverableId: deliverable?._id } : null;
  }

  const a = deliverable?.assigneeScore?.value;
  const c = deliverable?.creatorScore?.value;
  const local = computeFromPair(a, c, { type: "single" });
  return local ? { ...local, deliverableIndex: deliverable?.index, deliverableId: deliverable?._id } : null;
}
