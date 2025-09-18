// utils/saveDeliverable.js
import { editKpiDeliverables } from "../actions/kpiActions";

export const handleSaveDeliverable = async ({
   dispatch,
   kpiId,
   index,
   updates,
   scoreType,
   actorId,
   assigneeId,
   evaluatedUserId,
   deliverableId,
   occurrenceLabel,
   files = [],
   onScoreChange,
}) => {
   if (!assigneeId) throw new Error("handleSaveDeliverable: 'assigneeId' is required.");
   if (!deliverableId) throw new Error("handleSaveDeliverable: 'deliverableId' is required.");

   const stamped = { ...(updates || {}) };
   if (scoreType && stamped[scoreType] && typeof stamped[scoreType] === "object") {
     stamped[scoreType] = {
       ...stamped[scoreType],
       enteredBy: actorId,
       timestamp: new Date(),
     };
   }

   // Add this block to set the status to "Completed" when an assignee submits a score
   if (scoreType === "assigneeScore") {
     stamped.status = "Completed";
   }

   const basePayload = {
     assigneeId,
     evaluatedUserId,
     deliverableId,
     occurrenceLabel: occurrenceLabel || null,
     index: typeof index === "number" ? index : undefined,
     scoreType,
     updates: stamped,
   };

   let result;

   if (files && files.length > 0) {
     const fd = new FormData();
     fd.append("assigneeId", assigneeId);
     if (evaluatedUserId) fd.append("evaluatedUserId", evaluatedUserId);
     fd.append("deliverableId", deliverableId);
     if (occurrenceLabel) fd.append("occurrenceLabel", occurrenceLabel);
     if (typeof index === "number") fd.append("index", String(index));
     fd.append("scoreType", scoreType);
     fd.append("updates", JSON.stringify(stamped));
     // ... append files ...
     result = await dispatch(editKpiDeliverables(kpiId, fd, true));
   } else {
     result = await dispatch(editKpiDeliverables(kpiId, basePayload));
   }

   // ... (existing logic after dispatch, e.g., onScoreChange, fetchUserKpis)
};