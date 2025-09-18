// src/utils/saveDeliverable.js
import { editKpiDeliverables } from "../actions/kpiActions";

/**
 * Save/submit a deliverable (optionally with files).
 * Returns the result of the Redux dispatch so callers can react to success/failure.
 */
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
}) => {
  if (!dispatch) throw new Error("handleSaveDeliverable: 'dispatch' is required.");
  if (!kpiId) throw new Error("handleSaveDeliverable: 'kpiId' is required.");
  if (!assigneeId) throw new Error("handleSaveDeliverable: 'assigneeId' is required.");
  if (!deliverableId) throw new Error("handleSaveDeliverable: 'deliverableId' is required.");

  // Clone updates and stamp metadata when a score object is being submitted
  const stamped = { ...(updates || {}) };

  if (scoreType && stamped[scoreType] && typeof stamped[scoreType] === "object") {
    stamped[scoreType] = {
      ...stamped[scoreType],
      enteredBy: actorId,
      timestamp: new Date(),
    };
  }

  // If assignee submits a score, mark the occurrence/deliverable as completed
  if (scoreType === "assigneeScore") {
    stamped.status = "Completed";
  }

  const basePayload = {
    assigneeId,
    evaluatedUserId, // may be undefined; backend should handle
    deliverableId,
    occurrenceLabel: occurrenceLabel || null,
    index: typeof index === "number" ? index : undefined,
    scoreType,
    updates: stamped,
  };

  try {
    // If there are files, switch to multipart FormData
    if (Array.isArray(files) && files.length > 0) {
      const fd = new FormData();
      fd.append("assigneeId", assigneeId);
      if (evaluatedUserId) fd.append("evaluatedUserId", evaluatedUserId);
      fd.append("deliverableId", deliverableId);
      if (occurrenceLabel) fd.append("occurrenceLabel", occurrenceLabel);
      if (typeof index === "number") fd.append("index", String(index));
      if (scoreType) fd.append("scoreType", scoreType);
      fd.append("updates", JSON.stringify(stamped));

      // Append files; backend should expect 'files' as a repeated field
      files.forEach((file, i) => {
        // Supports File/Blob; name falls back to a deterministic placeholder
        const name = file?.name || `file_${i}`;
        fd.append("files", file, name);
      });

      // Third param 'true' indicates multipart to your action creator
      return await dispatch(editKpiDeliverables(kpiId, fd, true));
    }

    // JSON payload path
    return await dispatch(editKpiDeliverables(kpiId, basePayload));
  } catch (err) {
    
    throw err;
  }
};
