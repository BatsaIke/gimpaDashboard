// src/admin/KPIs/KPIBoard/KPIDetails/Deliverables/DeliverableReview/DeliverableReviewLogic.js
import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleSaveDeliverable } from "../../../../../../utils/saveDeliverable";
import { fetchUserKpis } from "../../../../../../actions/kpiActions";
import { selectUserKpiById } from "../../../../../../utils/kpiSelectors";

// Helpers
const hasNumber = (v) => typeof v === "number" && !Number.isNaN(v);
const pad = (n) => String(n).padStart(2, "0");
const norm = (v) => (v == null ? "" : String(v));
const EMPTY_ARR = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

function inferPatternFromLabels(labels = []) {
  const sample = labels.find(Boolean) || "";
  if (/^\d{4}$/.test(sample)) return "yearly";
  if (/^\d{4}-\d{2}$/.test(sample)) return "monthly";
  if (/^\d{4}-\d{2}-\d{2}$/.test(sample)) return "daily";
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}(:\d{2})?$/.test(sample)) return "hourly";
  return "monthly";
}

function autoLabelFrom(occ = EMPTY_ARR, declaredPattern = "") {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const pattern =
    (declaredPattern || "").toLowerCase() ||
    inferPatternFromLabels(occ.map((o) => o?.periodLabel));
  switch (pattern) {
    case "yearly": return `${y}`;
    case "daily": return `${y}-${m}-${d}`;
    case "hourly": return `${y}-${m}-${d} ${h}:00`;
    case "monthly":
    default: return `${y}-${m}`;
  }
}

export const useDeliverableReview = ({
  kpiId,
  index,
  assigneeId,
  selectedOccurrenceLabel,
  onSelectOccurrence,
  onScoreChange,
}) => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);
  const actorId = authUser?._id;

  // Pull KPI for the assignee
  const userKpi = useSelector((state) => selectUserKpiById(state, assigneeId, kpiId));

  // Ensure KPI is loaded (no early returns)
  useEffect(() => {
    if (!userKpi && assigneeId) {
      dispatch(fetchUserKpis(assigneeId));
    }
  }, [dispatch, assigneeId, userKpi]);

  // 🛠 FIX: Memoize userSpecificMap so its identity is stable
  const userSpecificMap = useMemo(() => {
    return userKpi?.userSpecific?.deliverables || EMPTY_OBJ;
  }, [userKpi?.userSpecific?.deliverables]);

  // Extract the user-specific deliverables array with a stable reference
  const allUserDeliverables = useMemo(() => {
    const arr = userSpecificMap[norm(assigneeId)];
    return Array.isArray(arr) ? arr : EMPTY_ARR;
  }, [userSpecificMap, assigneeId]);

  // Enhanced deliverable lookup with score fallback
  const userSpecificDeliverable = useMemo(() => {
    const base = allUserDeliverables[index] || {};
    return {
      ...base,
      assigneeScore: allUserDeliverables[index]?.assigneeScore ?? base?.assigneeScore,
      creatorScore: allUserDeliverables[index]?.creatorScore ?? base?.creatorScore,
    };
  }, [allUserDeliverables, index]);

  // Recurrence flags and occurrences with stable reference
  const isRecurring = useMemo(() => {
    const occ = userSpecificDeliverable?.occurrences;
    return Array.isArray(occ) && occ.length > 0;
  }, [userSpecificDeliverable]);

  const occurrences = useMemo(() => {
    return isRecurring ? userSpecificDeliverable.occurrences : EMPTY_ARR;
  }, [isRecurring, userSpecificDeliverable]);

  // Auto-label when recurring
  const autoLabel = useMemo(() => {
    if (!isRecurring || !userSpecificDeliverable) return null;
    return autoLabelFrom(occurrences, userSpecificDeliverable.recurrencePattern);
  }, [isRecurring, userSpecificDeliverable, occurrences]);

  // Default selection
  useEffect(() => {
    if (isRecurring && !selectedOccurrenceLabel && autoLabel) {
      onSelectOccurrence?.(autoLabel);
    }
  }, [isRecurring, autoLabel, selectedOccurrenceLabel, onSelectOccurrence]);

  // Current occurrence
  const currentOccurrence = useMemo(() => {
    if (!isRecurring || !selectedOccurrenceLabel) return null;
    return occurrences.find((o) => o?.periodLabel === selectedOccurrenceLabel) || null;
  }, [isRecurring, occurrences, selectedOccurrenceLabel]);

  // Scores
  const assigneeScore = isRecurring
    ? currentOccurrence?.assigneeScore || userSpecificDeliverable?.assigneeScore
    : userSpecificDeliverable?.assigneeScore;

  const creatorScore = isRecurring
    ? currentOccurrence?.creatorScore || userSpecificDeliverable?.creatorScore
    : userSpecificDeliverable?.creatorScore;

  // Evidence
  const assigneeEvidence = isRecurring
    ? currentOccurrence?.assigneeScore?.supportingDocuments ||
      userSpecificDeliverable?.assigneeScore?.supportingDocuments ||
      EMPTY_ARR
    : userSpecificDeliverable?.assigneeScore?.supportingDocuments || EMPTY_ARR;

  const creatorEvidence = isRecurring
    ? currentOccurrence?.creatorScore?.supportingDocuments ||
      userSpecificDeliverable?.creatorScore?.supportingDocuments ||
      EMPTY_ARR
    : userSpecificDeliverable?.creatorScore?.supportingDocuments || EMPTY_ARR;

  // Flags
  const assigneeHasScore = hasNumber(assigneeScore?.value);
  const reviewedByCreator =
    hasNumber(creatorScore?.value) || Boolean(userSpecificDeliverable?.hasSavedCreator);
  const hasTargetOccurrence = !isRecurring || !!selectedOccurrenceLabel;

  // Save
  const saveCreatorReview = async ({ value, notes, files }) => {
    const numeric = Number(value);

    await handleSaveDeliverable({
      dispatch,
      kpiId,
      index,
      actorId,
      assigneeId,
      evaluatedUserId: assigneeId,
      deliverableId: userSpecificDeliverable?.deliverableId,
      occurrenceLabel: isRecurring ? selectedOccurrenceLabel : null,
      scoreType: "creatorScore",
      updates: {
        creatorScore: {
          value: numeric,
          notes,
          supportingDocuments: creatorScore?.supportingDocuments || EMPTY_ARR,
        },
      },
      files: files || EMPTY_ARR,
      onScoreChange,
    });

    if (assigneeId) await dispatch(fetchUserKpis(assigneeId));
  };

  // Minimal shape for UI compatibility
  const deliverable = userSpecificDeliverable
    ? {
        _id: userSpecificDeliverable.deliverableId,
        isRecurring,
        occurrences, // already stable
        status: userSpecificDeliverable.status,
        ...(!isRecurring
          ? {
              assigneeScore,
              creatorScore,
            }
          : {}),
      }
    : null;

  return {
    deliverable,
    isRecurring,
    enrichedOccurrences: occurrences,
    effectiveOccurrenceLabel: selectedOccurrenceLabel,
    assigneeHasScore,
    reviewedByCreator,
    assigneeEvidence,
    creatorScore,
    creatorEvidence,
    hasTargetOccurrence,
    saveCreatorReview,
  };
};
