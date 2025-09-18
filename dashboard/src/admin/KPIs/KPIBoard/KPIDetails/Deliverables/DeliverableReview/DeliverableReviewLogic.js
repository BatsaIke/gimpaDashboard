import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleSaveDeliverable } from "../../../../../../utils/saveDeliverable";
import { fetchUserKpis } from "../../../../../../actions/kpiActions";
import { selectUserKpiById } from "../../../../../../utils/kpiSelectors";

// Helper functions
const hasNumber = (v) => typeof v === "number" && !Number.isNaN(v);
const pad = (n) => String(n).padStart(2, "0");
const norm = (v) => (v == null ? "" : String(v));

function inferPatternFromLabels(labels = []) {
  const sample = labels.find(Boolean) || "";
  if (/^\d{4}$/.test(sample)) return "yearly";
  if (/^\d{4}-\d{2}$/.test(sample)) return "monthly";
  if (/^\d{4}-\d{2}-\d{2}$/.test(sample)) return "daily";
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}(:\d{2})?$/.test(sample)) return "hourly";
  return "monthly";
}

function autoLabelFrom(occurrences = [], declaredPattern = "") {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const pattern =
    (declaredPattern || "").toLowerCase() ||
    inferPatternFromLabels(occurrences.map((o) => o?.periodLabel));
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
  onScoreChange
}) => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);
  const actorId = authUser?._id;

  // Get user KPI data
  const userKpi = useSelector((state) => selectUserKpiById(state, assigneeId, kpiId));
  
  // Extract ALL user-specific deliverables data
  const userSpecificMap = userKpi?.userSpecific?.deliverables || {};
  const allUserDeliverables = userSpecificMap[norm(assigneeId)] || [];
  
  // Enhanced deliverable lookup with score fallback
  const userSpecificDeliverable = useMemo(() => {
    const baseDeliverable = allUserDeliverables[index] || {};
    const arrayElement = allUserDeliverables[index];
    
    return {
      ...baseDeliverable,
      assigneeScore: arrayElement?.assigneeScore || baseDeliverable?.assigneeScore,
      creatorScore: arrayElement?.creatorScore || baseDeliverable?.creatorScore
    };
  }, [allUserDeliverables, index]);

  // Debug logs
  // useEffect(() => {
  //   console.group('[DeliverableReview] Data Debug');
  //   console.log('Complete deliverables array:', allUserDeliverables);
  //   console.log('Enhanced deliverable:', userSpecificDeliverable);
  //   console.groupEnd();
  // }, [allUserDeliverables, userSpecificDeliverable]);

  // Handle both recurring and non-recurring deliverables
  const isRecurring = Array.isArray(userSpecificDeliverable?.occurrences) && 
                     userSpecificDeliverable.occurrences.length > 0;

  const occurrences = isRecurring ? userSpecificDeliverable.occurrences : [];

  // Auto-label logic for recurring
  const autoLabel = useMemo(() => {
    if (!isRecurring || !userSpecificDeliverable) return null;
    return autoLabelFrom(occurrences, userSpecificDeliverable.recurrencePattern);
  }, [isRecurring, userSpecificDeliverable, occurrences]);

  // Handle occurrence selection
  useEffect(() => {
    if (isRecurring && !selectedOccurrenceLabel && autoLabel) {
      onSelectOccurrence?.(autoLabel);
    }
  }, [isRecurring, autoLabel, selectedOccurrenceLabel, onSelectOccurrence]);

  // Get current occurrence if recurring
  const currentOccurrence = useMemo(() => {
    if (!isRecurring || !selectedOccurrenceLabel) return null;
    return occurrences.find(o => o?.periodLabel === selectedOccurrenceLabel) || null;
  }, [isRecurring, occurrences, selectedOccurrenceLabel]);

  // Get scores
  const assigneeScore = isRecurring
    ? currentOccurrence?.assigneeScore || userSpecificDeliverable?.assigneeScore
    : userSpecificDeliverable?.assigneeScore;

  const creatorScore = isRecurring
    ? currentOccurrence?.creatorScore || userSpecificDeliverable?.creatorScore
    : userSpecificDeliverable?.creatorScore;

  // Get evidence
  const assigneeEvidence = isRecurring
    ? currentOccurrence?.assigneeScore?.supportingDocuments || 
      userSpecificDeliverable?.assigneeScore?.supportingDocuments || 
      []
    : userSpecificDeliverable?.assigneeScore?.supportingDocuments || [];

  const creatorEvidence = isRecurring
    ? currentOccurrence?.creatorScore?.supportingDocuments || 
      userSpecificDeliverable?.creatorScore?.supportingDocuments || 
      []
    : userSpecificDeliverable?.creatorScore?.supportingDocuments || [];

  // Status flags
  const assigneeHasScore = hasNumber(assigneeScore?.value);
  const reviewedByCreator = hasNumber(creatorScore?.value) || 
                          Boolean(userSpecificDeliverable?.hasSavedCreator);
  const hasTargetOccurrence = !isRecurring || !!selectedOccurrenceLabel;

  // Save function
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
          supportingDocuments: creatorScore?.supportingDocuments || [] 
        } 
      },
      files: files || [],
      onScoreChange
    });

    if (assigneeId) await dispatch(fetchUserKpis(assigneeId));
  };

  // Return minimal deliverable shape for UI compatibility
  const deliverable = userSpecificDeliverable 
    ? { 
        _id: userSpecificDeliverable.deliverableId,
        isRecurring,
        occurrences,
        status: userSpecificDeliverable.status,
        ...(!isRecurring ? {
          assigneeScore,
          creatorScore
        } : {})
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
    saveCreatorReview
  };
};