// utils/kpiUtils.ts
// ----------------------------------------------------------
//  Helpers + core logic for per-user KPI & deliverable state
// ----------------------------------------------------------

import mongoose from "mongoose";
import { IKpi, IDeliverable, IScoreSubmission } from "../models/Kpi";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";

export type KpiStatus = IKpi["status"];

/* -------------------------------------------------- */
/*  Snapshot helper                                   */
/* -------------------------------------------------- */

function toSnapshot(
  raw: unknown,
  userId: string
): IScoreSubmission | undefined {
  if (raw == null) return undefined;

  if (typeof raw === "number") {
    return {
      value: raw,
      notes: "",
      enteredBy: new mongoose.Types.ObjectId(userId),
      timestamp: new Date(),
    };
  }

  const o = raw as any;
  return {
    value: o.value,
    notes: o.notes ?? "",
    supportingDocuments: o.supportingDocuments ?? [],
    enteredBy: o.enteredBy ?? new mongoose.Types.ObjectId(userId),
    timestamp: o.timestamp ?? new Date(),
  };
}

/* -------------------------------------------------- */
/*  Global / personal status                          */
/* -------------------------------------------------- */

export function updateKpiStatus(
  kpi: IKpi,
  newStatus: KpiStatus,
  callerId: string,
  isCreator: boolean,
  promoteGlobally = false
) {
  if (isCreator && promoteGlobally) {
    kpi.status = newStatus;
    kpi.userSpecific?.statuses.clear();
  }

  normaliseUserSpecific(kpi);
  kpi.userSpecific!.statuses.set(callerId, newStatus);
}

/* -------------------------------------------------- */
/*  Deliverable updates                               */
/* -------------------------------------------------- */

export function updateKpiDeliverables( 
  kpi: IKpi, 
  patches: Partial<IDeliverable>[],
  callerId: string,
  isCreator: boolean,
  assigneeId?: string | { _id: string }
) {
  if (!Array.isArray(patches) || patches.length === 0) return;

  normaliseUserSpecific(kpi);

  const safeAssigneeId =
    assigneeId && typeof assigneeId === "object"
      ? String(assigneeId._id)
      : String(assigneeId ?? "");

  const targetUserId = isCreator
    ? safeAssigneeId || String(callerId)
    : String(callerId);

  let view = kpi.userSpecific!.deliverables.get(targetUserId);
  if (!view) {
    view = kpi.deliverables.map((d) => ({
      ...d,
      hasSavedAssignee: false,
      hasSavedCreator: false,
    }));
    kpi.userSpecific!.deliverables.set(targetUserId, view);
  }

  patches.forEach((patch, idx) => {
    if (!patch || !view?.[idx]) return;

    const cur = view[idx];

    if (!isCreator) {
      const scoreObj = toSnapshot(patch.assigneeScore, callerId);
      if (scoreObj && patch.notes !== undefined) {
        scoreObj.notes = patch.notes;
        delete cur.notes;
      }

      const cleanEvidence = Array.isArray(patch.evidence)
        ? patch.evidence.filter((e) => typeof e === "string")
        : undefined;

      Object.assign(cur, {
        assigneeScore: scoreObj || cur.assigneeScore,
        evidence: cleanEvidence ?? cur.evidence,
        status: patch.status ?? cur.status,
        hasSavedAssignee: true, // always set internally
      });

      return;
    }

    const assigneeHasSubmitted =
      cur.hasSavedAssignee ||
      kpi.assignedUsers.some((u) =>
        kpi.userSpecific!.deliverables
          .get(String(u._id))
          ?.at(idx)?.hasSavedAssignee
      );

    if (!assigneeHasSubmitted) {
      throw new Error("Assignee must submit before you can review.");
    }

    Object.assign(cur, {
      creatorScore: toSnapshot(patch.creatorScore, callerId) || cur.creatorScore,
      creatorNotes: patch.creatorNotes ?? cur.creatorNotes,
      status: patch.status ?? cur.status,
      hasSavedCreator: true,
    });
  });

  // 🆕 Mirror creator status changes into assignee view
  if (isCreator && safeAssigneeId) {
    const assigneeView = kpi.userSpecific!.deliverables.get(safeAssigneeId);
    if (assigneeView) {
      assigneeView.forEach((deliv, i) => {
        const match = patches[i];
        if (match?.status && match.status !== deliv.status) {
          deliv.status = match.status;
        }
      });

      kpi.markModified(`userSpecific.deliverables.${safeAssigneeId}`);
    }
  }

  kpi.markModified(`userSpecific.deliverables.${targetUserId}`);
}


/* -------------------------------------------------- */
/*  Map normalisation                                 */
/* -------------------------------------------------- */

export function normaliseUserSpecific(kpi: IKpi) {
  if (!kpi.userSpecific) {
    kpi.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  if (!(kpi.userSpecific.statuses instanceof Map)) {
    kpi.userSpecific.statuses = new Map(
      Object.entries(kpi.userSpecific.statuses)
    );
  }
  if (!(kpi.userSpecific.deliverables instanceof Map)) {
    kpi.userSpecific.deliverables = new Map(
      Object.entries(kpi.userSpecific.deliverables)
    );
  }
}

/* -------------------------------------------------- */
/*  Build caller-specific deliverables                */
/* -------------------------------------------------- */

export async function buildDeliverablesForCaller(
  kpi: IKpi,
  viewUserId: string
): Promise<IDeliverable[]> {
  const assigneeView =
    kpi.userSpecific?.deliverables.get(viewUserId) ?? kpi.deliverables;

  const creatorId   = String(kpi.createdBy);
  const creatorView = kpi.userSpecific?.deliverables.get(creatorId);

  const flags = await DeliverableDiscrepancy.find({ kpiId: kpi._id }).lean();
  const byIdx = new Map(
    flags.map(f => [
      f.deliverableIndex,
      {
        status         : f.resolved ? "resolved" : "open",
        meetingBooked  : !!f.meeting,
        reason         : f.reason,
        resolutionNotes: f.resolutionNotes ?? null
      }
    ])
  );

  return assigneeView.map((assigneeDel, idx) => {
    const reviewDel = creatorView ? creatorView[idx] : undefined;

    return {
      ...assigneeDel,
      creatorScore   : reviewDel?.creatorScore,
      creatorNotes   : reviewDel?.creatorNotes,
      hasSavedCreator: reviewDel?.hasSavedCreator ?? false,
      discrepancy    : byIdx.get(idx)
    };
  });
}
 