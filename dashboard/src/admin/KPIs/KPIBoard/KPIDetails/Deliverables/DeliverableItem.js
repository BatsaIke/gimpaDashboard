import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeliverableContent from "./DeliverableContent";
import resolveDeliverable from "../../../../../utils/deliverableUtils";
import { fetchDiscrepancies } from "../../../../../actions/discrepancyActions";

const DeliverableItem = ({
  index,
  deliverable = {},
  kpi = { _id: null, isCreator: false, isAssignedUser: false },
  ALL_STATUSES = [],
  onDeliverableStatusChange,
  onAttachChange,
  onScoreChange,
  isUserView = false,
  onBookMeeting,
}) => {
  const { isCreator, isAssignedUser, _id: kpiId } = kpi;
  const d = resolveDeliverable(deliverable);
  const dispatch =useDispatch()

  const authUser = useSelector(s => s.auth.user);
  const allFlags = useSelector(s => s.discrepancies.list);

  

   const targetAssigneeId =
   isCreator ? (d.assigneeScore?.enteredBy || d.assigneeId) : authUser._id;

 const discrepancy = allFlags.find(f =>
   (f.kpiId?._id || f.kpiId) === kpiId &&
   f.delIndex === index &&
   (f.assigneeId?._id || f.assigneeId) === targetAssigneeId
 );

  const isOpenDiscrepancy     = discrepancy && !discrepancy.resolved;
  const isResolvedDiscrepancy = discrepancy?.resolved;
  const meetingBooked         = !!discrepancy?.meeting;
  const discrepancyTxt        = discrepancy?.reason || "Score discrepancy detected";
  const resolutionTxt         = discrepancy?.resolutionNotes || "";

  /* ───────────── status dropdown ───────────── */
  const hasScore = !!d?.assigneeScore?.value;
  const deliverableStatuses = (() => {
    if (isCreator && isUserView) {
      return hasScore
        ? ["Pending", "In Progress", "Completed", "Approved"]
        : ["Pending", "In Progress"];
    }
    if (isAssignedUser) {
      return hasScore
        ? ["Pending", "In Progress", "Completed"]
        : ["Pending", "In Progress"];
    }
    if (isCreator) return ALL_STATUSES;
    return [d?.status || "Pending"];
  })();

  /* ───────────── visibility of forms ────────── */
  const showCompletionForm =
    isAssignedUser && !isCreator && !isOpenDiscrepancy;
  const showReviewForm =
    isCreator && isUserView && !isOpenDiscrepancy;

  /* ───────────── handlers ───────────────────── */
  const handleStatusChange = (e) =>
    onDeliverableStatusChange(index, e.target.value);
  const handleBookMeeting = () => onBookMeeting?.(index);
  const handleAttach = (field, val) => onAttachChange(index, field, val);

  const handleScore = (score, role) => {
    onScoreChange(index, score, role);

    if (role === "creator") {
      // Manually patch the current deliverable object so UI updates immediately
      d.creatorScore = {
        ...(d.creatorScore || {}),
        value: score,
        notes: d?.creatorScore?.notes || "",
        enteredBy: d?.creatorScore?.enteredBy || "",
        timestamp: new Date(),
      };
      d.hasSavedCreator = true;
    }
  };

useEffect(() => {
  if (kpi._id) dispatch(fetchDiscrepancies(kpi._id));
}, [kpi._id, dispatch]);

  return (
    <DeliverableContent
      index={index}
      d={d}
      kpiId={kpiId}
      statuses={deliverableStatuses}
      currentStatus={d?.status || "Pending"}
      onStatusChange={handleStatusChange}
      /* discrepancy props */
      isOpenDiscrepancy={isOpenDiscrepancy}
      isResolvedDiscrepancy={isResolvedDiscrepancy}
      discrepancyTxt={discrepancyTxt}
      resolutionTxt={resolutionTxt}
      meetingBooked={meetingBooked}
      onBookMeeting={handleBookMeeting}
      /* forms & helpers */
      showCompletionForm={showCompletionForm}
      showReviewForm={showReviewForm}
      statusColorMap={{
        Pending: "#F59E0B",
        "In Progress": "#3B82F6",
        Completed: "#10B981",
        Approved: "#8B5CF6",
      }}
      onAttachChange={handleAttach}
      onScoreChange={handleScore}
      isAssignedUser={isAssignedUser}
      isCreator={isCreator}
    />
  );
};

export default React.memo(DeliverableItem);
