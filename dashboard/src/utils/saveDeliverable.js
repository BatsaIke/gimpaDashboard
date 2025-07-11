// utils/saveDeliverable.js
import {
 
  editKpiDeliverables,
  uploadKpiEvidence,     // ⬅️ make sure this action is exported
} from "../actions/kpiActions";
import { fetchKpiHeaders } from "../actions/kpiHeaderActions";

/**
 * Sends a partial patch for ONE deliverable, then mirrors the
 * change into local Redux/UI state.
 *
 * @param {object}   opts
 * @param {function} opts.dispatch         – redux-thunk dispatch
 * @param {string}   opts.kpiId            – KPI _id
 * @param {number}   opts.index            – deliverable index
 * @param {object}   opts.updates          – fields to merge into that deliverable
 * @param {function} opts.onScoreChange    – callback used by UI list
 * @param {function} opts.onAttachChange   – callback used by UI list
 * @param {string}   opts.scoreType        – "assigneeScore" | "creatorScore"
 * @param {string}   opts.userId           – auth user _id (for audit trail)
 * @param {object=}  opts.originalDeliverable – current deliverable (to merge evidence)
 * @param {string=}  opts.assigneeId       – target assignee when creator reviews
 */
export const handleSaveDeliverable = async ({
  dispatch,
  kpiId,
  index,
  updates,
  onScoreChange,
  onAttachChange,
  scoreType,
  userId,
  originalDeliverable = null,
  assigneeId,
}) => {
  /* -------------------------------------------------- */
  /* 0.  Embed notes inside the score object            */
  /* -------------------------------------------------- */
  if (updates.notes !== undefined) {
    // create score object if caller only provided a value number
    if (
      !updates[scoreType] ||
      typeof updates[scoreType] !== "object"
    ) {
      updates[scoreType] = { value: updates[scoreType] };
    }
    updates[scoreType].notes = updates.notes;
    delete updates.notes; // strip top-level notes
  }

  /* -------------------------------------------------- */
  /* 1.  Inject audit-trail metadata                    */
  /* -------------------------------------------------- */
  if (updates[scoreType] && typeof updates[scoreType] === "object") {
    updates[scoreType] = {
      ...updates[scoreType],
      enteredBy: userId,
      timestamp: new Date(),
    };
  }

  /* -------------------------------------------------- */
  /* 2.  Handle new evidence uploads (File objects)     */
  /* -------------------------------------------------- */
  let newEvidencePaths = [];

  if (Array.isArray(updates.newEvidence) && updates.newEvidence.length) {
    // Upload each file and collect the returned path strings
    for (const file of updates.newEvidence) {
      const resp = await dispatch(uploadKpiEvidence(kpiId, file));
      if (resp?.success && resp.filePath) newEvidencePaths.push(resp.filePath);
    }
  }

  // Merge with any existing evidence on the deliverable
  if (newEvidencePaths.length) {
    const prev = originalDeliverable?.evidence || [];
    updates.evidence = [...prev, ...newEvidencePaths];
  }

  delete updates.newEvidence; // remove helper field so the API doesn’t choke

  /* -------------------------------------------------- */
  /* 3.  Build a SAFE sparse-patch array                */
  /* -------------------------------------------------- */
  const patchArray = Array(index).fill({}).concat([updates]);

  const patchBody = {
    deliverables: patchArray,
    ...(assigneeId ? { assigneeId } : {}),
  };

  /* -------------------------------------------------- */
  /* 4.  Fire the PATCH request                         */
  /* -------------------------------------------------- */
  const result = await dispatch(editKpiDeliverables(kpiId, patchBody));
  if (!result.success) throw new Error("Edit KPI failed");

  /* -------------------------------------------------- */
  /* 5.  Refresh board & mirror local state             */
  /* -------------------------------------------------- */
  await dispatch(fetchKpiHeaders());

  if (updates[scoreType]) {
    onScoreChange(
      index,
      updates[scoreType].value,
      scoreType === "creatorScore" ? "creator" : "assignee"
    );
  }

  // Mirror other simple fields (exclude score & helper keys)
  Object.entries(updates).forEach(([key, val]) => {
    if (key !== scoreType && key !== "evidence") {
      onAttachChange(index, key, val);
    }
  });

  // Append freshly-uploaded evidence to UI
  if (newEvidencePaths.length) {
    onAttachChange(index, "evidence", newEvidencePaths);
  }
};
