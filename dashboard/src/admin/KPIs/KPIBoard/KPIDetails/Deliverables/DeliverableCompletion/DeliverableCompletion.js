// DeliverableCompletion.jsx
import React, { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./DeliverableCompletion.module.css";
import DeliverableHeader from "./DeliverableHeader";
import DeliverableSummary from "./DeliverableSummary";
import DeliverableForm from "./DeliverableForm";
import { handleSaveDeliverable } from "../../../../../../utils/saveDeliverable";
import OccurrencePicker from "./OccurrencePicker";
import { fetchUserKpis } from "../../../../../../actions/kpiActions";
import { selectUserDeliverableByIndex, selectUserKpiById } from "../../../../../../utils/kpiSelectors";

/* helpers */
const pad = (n) => String(n).padStart(2, "0");
function inferPatternFromLabels(labels = []) {
  const s = labels.find(Boolean) || "";
  if (/^\d{4}$/.test(s)) return "yearly";
  if (/^\d{4}-\d{2}$/.test(s)) return "monthly";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return "daily";
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}(:\d{2})?$/.test(s)) return "hourly";
  return "monthly";
}
function getAutoOccurrenceLabel(deliverable, occurrences) {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const declared = (deliverable?.recurrencePattern || "").toLowerCase();
  const pattern = declared || inferPatternFromLabels((occurrences || []).map(o => o?.periodLabel));
  switch (pattern) {
    case "yearly":  return `${y}`;
    case "daily":   return `${y}-${m}-${d}`;
    case "hourly":  return `${y}-${m}-${d} ${h}:00`;
    case "monthly":
    default:        return `${y}-${m}`;
  }
}

const DeliverableCompletion = ({
  kpiId,
  index,
  onScoreChange,
  isAssignedUser,
  selectedOccurrenceLabel,
  onSelectOccurrence = () => {},
  evaluatedUserId,
}) => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);
  const userId = evaluatedUserId || authUser?._id;

  // Always call hooks – no early returns
  const userKpi = useSelector((s) => selectUserKpiById(s, userId, kpiId));
  useEffect(() => {
    if (!userKpi && userId) {
      dispatch(fetchUserKpis(userId));
    }
  }, [dispatch, userId, userKpi]);

  const deliverable = useSelector((s) =>
    selectUserDeliverableByIndex(s, userId, kpiId, index)
  );

  const isRecurring = !!deliverable?.isRecurring;
  const occurrences = Array.isArray(deliverable?.occurrences) ? deliverable.occurrences : [];

  const autoLabel = useMemo(() => {
    if (!isRecurring || !deliverable) return null;
    return getAutoOccurrenceLabel(deliverable, occurrences);
  }, [isRecurring, deliverable, occurrences]);

  useEffect(() => {
    if (isRecurring && !selectedOccurrenceLabel && autoLabel) {
      onSelectOccurrence(autoLabel);
    }
  }, [isRecurring, autoLabel, selectedOccurrenceLabel, onSelectOccurrence]);

  const enrichedOccurrences = useMemo(() => {
    if (!isRecurring || !autoLabel) return occurrences;
    const has = occurrences.some(o => o?.periodLabel === autoLabel);
    return has ? occurrences : [{ periodLabel: autoLabel, status: "Pending" }, ...occurrences];
  }, [isRecurring, autoLabel, occurrences]);

  const effectiveOccurrenceLabel = isRecurring
    ? (selectedOccurrenceLabel || autoLabel || null)
    : null;

  const targetOccurrence = useMemo(() => {
    if (!isRecurring || !effectiveOccurrenceLabel) return null;
    return enrichedOccurrences.find(o => o?.periodLabel === effectiveOccurrenceLabel) || null;
  }, [isRecurring, enrichedOccurrences, effectiveOccurrenceLabel]);

  const hasDone = useMemo(() => {
    if (isRecurring) {
      return !!targetOccurrence?.assigneeScore || targetOccurrence?.status === "Completed";
    }
    return !!deliverable?.assigneeScore?.value
      || !!deliverable?.hasSavedAssignee
      || deliverable?.status === "Completed";
  }, [isRecurring, targetOccurrence, deliverable]);

  const scoreData = useMemo(() => {
    if (isRecurring && targetOccurrence) {
      return {
        assigneeScore: targetOccurrence.assigneeScore,
        creatorScore: targetOccurrence.creatorScore,
        isOccurrence: true,
        occurrenceDate: targetOccurrence.periodLabel,
      };
    }
    return {
      assigneeScore: deliverable?.assigneeScore,
      creatorScore: deliverable?.creatorScore,
      isOccurrence: false,
    };
  }, [isRecurring, targetOccurrence, deliverable]);

  // Single return; render loading branch via JSX conditionals
  return (
    <div className={styles.completionCard}>
      {!deliverable ? (
        <div>Loading deliverable…</div>
      ) : (
        <>
          <DeliverableHeader
            hasDone={hasDone}
            isRecurring={isRecurring}
            occurrenceDate={isRecurring ? effectiveOccurrenceLabel : undefined}
          />

          {isRecurring && (
            <OccurrencePicker
              occurrences={enrichedOccurrences}
              value={effectiveOccurrenceLabel || ""}
              onChange={onSelectOccurrence}
            />
          )}

          {hasDone ? (
            <DeliverableSummary
              deliverable={deliverable}
              occurrence={isRecurring ? targetOccurrence : undefined}
              isRecurring={isRecurring}
              scoreData={scoreData}
              occurrenceDate={isRecurring ? effectiveOccurrenceLabel : undefined}
            />
          ) : (
            <DeliverableForm
              kpiId={kpiId}
              index={index}
              deliverable={deliverable}
              occurrenceLabel={isRecurring ? effectiveOccurrenceLabel : null}
              onScoreChange={onScoreChange}
              isAssignedUser={isAssignedUser}
              dispatch={dispatch}
              authUser={authUser}
              handleSaveDeliverable={handleSaveDeliverable}
              isRecurring={isRecurring}
              occurrences={enrichedOccurrences}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DeliverableCompletion;
