// src/components/KPIBoard/KPIDetails/Deliverables/DeliverableItem.jsx
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeliverableContent from "./DeliverableContent";
import resolveDeliverable from "../../../../../utils/deliverableUtils";
import useFetchKpiDiscrepancies from "../../../../hooks/useDiscrepancy/useFetchKpiDiscrepancies";
import useTargetAssigneeId from "../../../../hooks/deliverables/useTargetAssigneeId";
import useUserKpi from "../../../../hooks/useUserKpi";
import useDeliverableStatuses from "../../../../hooks/deliverables/useDeliverableStatuses";
import { KpiMeetingModal } from "../KpiDetailModal/KpiMeetingModal";
import { bookMeeting, fetchDiscrepancies } from "../../../../../actions/discrepancyActions";

// REVISED: useBackendFlagForIndex should be more robust with assigneeId and occurrenceLabel
const useBackendFlagForIndex = (kpiId, delIndex, occurrenceLabel = null, assigneeId) => {
  const discrepanciesList = useSelector((s) => s.discrepancies.list);

  return useMemo(() => {
    if (!discrepanciesList || !kpiId || delIndex == null || !assigneeId) return null;
    return discrepanciesList.find(
      (f) =>
        String(f?.kpiId?._id ?? f?.kpiId) === String(kpiId) &&
        String(f?.deliverableIndex ?? f?.delIndex) === String(delIndex) &&
        String(f?.assigneeId?._id ?? f?.assigneeId) === String(assigneeId) &&
        (occurrenceLabel ? f.occurrenceLabel === occurrenceLabel : !f.occurrenceLabel)
    ) || null;
  }, [discrepanciesList, kpiId, delIndex, occurrenceLabel, assigneeId]);
};

const DeliverableItem = ({
  index,
  deliverable = {}, // This is the enriched deliverable coming from `buildCallerResponse`
  kpi = { _id: null, isCreator: false, isAssignedUser: false },
  ALL_STATUSES = [],
  onDeliverableStatusChange,
  onScoreChange,
  isUserView = false,
  reviewTargetUserId,
}) => {
  const { isCreator, isAssignedUser, _id: kpiId } = kpi;
  const d = resolveDeliverable(deliverable); // d.discrepancy should already be available here
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);

  const targetAssigneeId = useTargetAssigneeId({ isCreator, isUserView, kpi, reviewTargetUserId });
  const userKpi = useUserKpi(targetAssigneeId, kpiId);

  // Load backend discrepancies (flags) into Redux store. This is crucial.
  useFetchKpiDiscrepancies(kpiId);

  // State to hold the currently selected occurrence label from DeliverableContent
  const [currentSelectedOccurrenceLabel, setCurrentSelectedOccurrenceLabel] = useState(null);

  // THE KEY: Use backendFlag as the single source of truth for discrepancy state
  const backendFlag = useBackendFlagForIndex(
    kpiId,
    index,
    d.isRecurring ? currentSelectedOccurrenceLabel : null,
    targetAssigneeId
  );

  // Derive all display flags directly from `backendFlag`
  const isOpenDiscrepancy = !!backendFlag && backendFlag.resolved === false;
  const isResolvedDiscrepancy = !!backendFlag && backendFlag.resolved === true;
  const meetingBooked = Boolean(backendFlag?.meeting?.bookedBy); // Check if the `meeting` object and `bookedBy` field exist
  const discrepancyTxt = backendFlag?.reason ?? "Score discrepancy detected";
  const resolutionTxt = backendFlag?.resolutionNotes ?? "";

  const hasScore = !!d?.assigneeScore?.value;
  const hasCreatorScore = !!d?.creatorScore?.value || d?.hasSavedCreator;

  const deliverableStatuses = useDeliverableStatuses({
    isCreator,
    isUserView,
    isAssignedUser,
    hasScore,
    currentStatus: d?.status,
    ALL_STATUSES,
  });

  // `canBookMeeting` should also use `meetingBooked` derived from `backendFlag`
  const canBookMeeting = !!backendFlag && !meetingBooked;

  const [meetingOpen, setMeetingOpen] = useState(false);

  const handleStatusChange = (e) => onDeliverableStatusChange(index, e.target.value);

  const handleBookMeeting = () => {
    if (!canBookMeeting) {
      console.warn("[DeliverableItem] Blocked: Cannot book meeting. No active backend discrepancy flag or meeting already booked.", { kpiId, deliverableIndex: index, backendFlag, meetingBooked });
      return;
    }
    setMeetingOpen(true);
  };

  const handleSubmitMeeting = async (data) => {
    const flagId = backendFlag?.id || backendFlag?._id;
    if (!flagId) {
      console.error("No discrepancy ID found for booking meeting submission.");
      return;
    }

    try {
      const ok = await dispatch(bookMeeting(flagId, data));
      if (ok) {
        // Important: Re-fetch discrepancies after booking to update the Redux store.
        // This will cause `backendFlag` to re-evaluate and update the UI.
        await dispatch(fetchDiscrepancies(kpiId));
        setMeetingOpen(false);
      }
    } catch (error) {
      console.error("Error booking meeting:", error);
    }
  };

  const handleScore = (score, role) => {
    onScoreChange(index, score, role);
    if (role === "creator") {
      deliverable.creatorScore = {
        value: score,
        notes: deliverable?.creatorScore?.notes || "",
        enteredBy: authUser._id,
        timestamp: new Date(),
        supportingDocuments: deliverable?.creatorScore?.supportingDocuments || [],
      };
      deliverable.hasSavedCreator = true;
    }
  };

  if (isUserView && isCreator && (!targetAssigneeId || !userKpi)) {
    return <div style={{ padding: 8 }}>Loading user data…</div>;
  }

  return (
    <>
      <DeliverableContent
        index={index}
        d={d}
        kpiId={kpiId}
        statuses={deliverableStatuses}
        currentStatus={d?.status || "Pending"}
        onStatusChange={handleStatusChange}
        isOpenDiscrepancy={isOpenDiscrepancy}
        isResolvedDiscrepancy={isResolvedDiscrepancy}
        discrepancyTxt={discrepancyTxt}
        resolutionTxt={resolutionTxt}
        meetingBooked={meetingBooked} // Pass the correct `meetingBooked` status
        onBookMeeting={handleBookMeeting}
        showCompletionForm={isAssignedUser && !isCreator && !isOpenDiscrepancy}
        showReviewForm={isCreator && isUserView && !isOpenDiscrepancy}
        statusColorMap={{
          Pending: "#F59E0B",
          "In Progress": "#3B82F6",
          Completed: "#10B981",
          Approved: "#8B5CF6",
        }}
        onScoreChange={handleScore}
        isAssignedUser={isAssignedUser}
        isCreator={isCreator}
        reviewTargetUserId={targetAssigneeId}
        hasCreatorScore={hasCreatorScore}
        discrepancy={backendFlag} // Pass the full `backendFlag` object
        canBookMeeting={canBookMeeting}
        onSelectedOccurrenceLabelChange={setCurrentSelectedOccurrenceLabel}
      />

      <KpiMeetingModal
        open={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        discrepancy={backendFlag} // Pass the full `backendFlag` object to the modal
        onSubmit={handleSubmitMeeting}
      />
    </>
  );
};

export default React.memo(DeliverableItem);