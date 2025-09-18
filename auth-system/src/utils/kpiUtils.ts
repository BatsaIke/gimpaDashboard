// utils/kpiUtils.ts
import mongoose from "mongoose";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";
import type {
  IKpi,
  IScoreSubmission,
  IDeliverableTemplate,
  IUserDeliverableState,
  IUserDeliverableOccurrence,
} from "../models/Kpi";

export type KpiStatus = IKpi["status"];

/* ---------- NEW: strong type for userSpecific ---------- */
export type UserSpecificState = {
  statuses: Map<string, KpiStatus>;
  deliverables: Map<string, IUserDeliverableState[]>;
};

/* ---------- helpers ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);

function mergeUnique(a?: string[], b?: string[]) {
  return Array.from(new Set([...(a ?? []), ...(b ?? [])]));
}

function toSnapshot(raw: unknown, userId: string): IScoreSubmission | undefined {
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

/* ---------- keep the old normaliser, but… ---------- */
export function normaliseUserSpecific(kpi: IKpi) {
  if (!kpi.userSpecific) {
    kpi.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  if (!(kpi.userSpecific.statuses instanceof Map)) {
    // @ts-ignore
    kpi.userSpecific.statuses = new Map(
      Object.entries(kpi.userSpecific.statuses as any)
    );
  }
  if (!(kpi.userSpecific.deliverables instanceof Map)) {
    // @ts-ignore
    kpi.userSpecific.deliverables = new Map(
      Object.entries(kpi.userSpecific.deliverables as any)
    );
  }
}

/* ---------- NEW: return a strongly-typed non-optional object ---------- */
export function ensureUserSpecific(kpi: IKpi): UserSpecificState {
  normaliseUserSpecific(kpi);
  // After normalise, TS still thinks it's optional, so we cast once here.
  return kpi.userSpecific as unknown as UserSpecificState;
}

/* ---------- UPDATED: uses ensureUserSpecific ---------- */
export function updateKpiStatus(
  kpi: IKpi,
  newStatus: KpiStatus,
  targetUserId: string,
  _isCreator: boolean,
  promoteGlobally = false
) {
  const us = ensureUserSpecific(kpi);

  if (promoteGlobally) {
    kpi.status = newStatus;
    us.statuses.clear();
  } else {
    us.statuses.set(targetUserId, newStatus);
  }

  kpi.markModified("userSpecific");
  kpi.markModified("userSpecific.statuses");
}

export type DiscrepancyView = {
  status: "open" | "resolved";
  meetingBooked: boolean;
  reason?: string;
  resolutionNotes?: string | null;
};

export interface ICallerDeliverable extends IDeliverableTemplate {
  status: "Pending" | "In Progress" | "Completed" | "Approved";
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;
  creatorNotes?: string;
  evidence?: string[];
  occurrences?: IUserDeliverableOccurrence[];
  hasSavedCreator?: boolean;
  discrepancy?: DiscrepancyView;
  _index?: number;
}

/* ---------- UPDATED: uses ensureUserSpecific ---------- */
export async function buildDeliverablesForCaller(
  kpi: IKpi,
  viewUserId: string
): Promise<ICallerDeliverable[]> {
  const templates: IDeliverableTemplate[] = kpi.deliverables || [];
  const us = ensureUserSpecific(kpi);

  const assigneeStates: IUserDeliverableState[] =
    us.deliverables.get(viewUserId) || [];
  const creatorStates: IUserDeliverableState[] =
    us.deliverables.get(String(kpi.createdBy)) || [];

  const creatorById = new Map<string, IUserDeliverableState>(
    creatorStates.map((s) => [String(s.deliverableId), s])
  );

  const flags = await DeliverableDiscrepancy.find({
    kpiId: kpi._id,
    assigneeId: viewUserId,
  })
    .lean()
    .exec();

  const byIdx = new Map<number, DiscrepancyView>(
    flags.map((f) => {
      const status: DiscrepancyView["status"] = f.resolved ? "resolved" : "open";
      return [
        f.deliverableIndex,
        {
          status,
          meetingBooked: !!f.meeting,
          reason: f.reason,
          resolutionNotes: f.resolutionNotes ?? null,
        },
      ];
    })
  );

  return templates.map((tpl, idx) => {
    const key = String(tpl._id);
    const local = assigneeStates.find((s) => String(s.deliverableId) === key);
    const creator = creatorById.get(key);

    const out: ICallerDeliverable = {
      ...tpl,
      status: local?.status ?? "Pending",
      assigneeScore: local?.assigneeScore,
      creatorScore: creator?.creatorScore ?? local?.creatorScore,
      creatorNotes: creator?.creatorNotes ?? local?.creatorNotes,
      hasSavedCreator: Boolean(creator?.creatorScore ?? local?.creatorScore),
      evidence: local?.evidence || [],
      occurrences: local?.occurrences || [],
      discrepancy: byIdx.get(idx),
      _index: idx,
    };
    return out;
  });
}
