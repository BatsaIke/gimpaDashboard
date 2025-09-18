// utils/kpiResponse.ts
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";
import type {
  IKpi,
  IDeliverableTemplate,
  IUserDeliverableState,
  IUserDeliverableOccurrence,
  IScoreSubmission,
} from "../models/Kpi";

/* --- ensure Maps survive .lean() -------------------------------- */
export function normaliseUserSpecific(kpi: IKpi) {
  if (!kpi.userSpecific) {
    kpi.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  if (!(kpi.userSpecific.statuses instanceof Map)) {
    kpi.userSpecific.statuses = new Map(
      Object.entries(kpi.userSpecific.statuses as any)
    );
  }
  if (!(kpi.userSpecific.deliverables instanceof Map)) {
    kpi.userSpecific.deliverables = new Map(
      Object.entries(kpi.userSpecific.deliverables as any)
    );
  }
}

/** What the UI expects per deliverable: template + local state + flags */
export interface ICallerDeliverable extends IDeliverableTemplate {
  // local state (for the viewing user)
  status: "Pending" | "In Progress" | "Completed" | "Approved";
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;            // overlay from creator’s view if present
  evidence?: string[];
  occurrences?: IUserDeliverableOccurrence[];
  hasSavedCreator?: boolean;

  // optional discrepancy info
  discrepancy?: {
    status: "open" | "resolved";
    meetingBooked: boolean;
    reason?: string;
    resolutionNotes?: string | null;
  };

  // (optional) keep index if other code relies on it
  _index?: number;
}

/* --- build caller-specific deliverables ------------------------- */
export async function buildDeliverablesForCaller(
  kpi: IKpi,
  callerId: string
): Promise<ICallerDeliverable[]> {
  const templates: IDeliverableTemplate[] = kpi.deliverables || [];

  const assigneeStates: IUserDeliverableState[] =
    kpi.userSpecific?.deliverables.get(callerId) || [];

  const creatorStates: IUserDeliverableState[] =
    kpi.userSpecific?.deliverables.get(String(kpi.createdBy)) || [];

  const creatorById = new Map<string, IUserDeliverableState>(
    creatorStates.map((s) => [String(s.deliverableId), s])
  );

  // pull discrepancy flags for THIS assignee
  const flags = await DeliverableDiscrepancy.find({
    kpiId: kpi._id,
    assigneeId: callerId,
  })
    .lean()
    .exec();

  const flagByIdx = new Map<
    number,
    { status: "open" | "resolved"; meetingBooked: boolean; reason?: string; resolutionNotes?: string | null }
  >(
    flags.map((f) => [
      f.deliverableIndex,
      {
        status: f.resolved ? "resolved" : "open",
        meetingBooked: !!f.meeting,
        reason: f.reason,
        resolutionNotes: f.resolutionNotes ?? null,
      },
    ])
  );

  // Build in template order
  return templates.map((tpl, idx) => {
    const key = String(tpl._id);
    const local = assigneeStates.find((s) => String(s.deliverableId) === key);
    const creator = creatorById.get(key);

    const out: ICallerDeliverable = {
      ...tpl, // title, action, indicator, performanceTarget, priority, etc.
      status: local?.status ?? "Pending",
      assigneeScore: local?.assigneeScore,
      // prefer creator’s review if present, else local (some flows mirror into local)
      creatorScore: creator?.creatorScore ?? local?.creatorScore,
      hasSavedCreator: Boolean(creator?.creatorScore ?? local?.creatorScore),
      evidence: local?.evidence || [],
      occurrences: local?.occurrences || [],
      discrepancy: flagByIdx.get(idx),
      _index: idx,
    };

    return out;
  });
}
