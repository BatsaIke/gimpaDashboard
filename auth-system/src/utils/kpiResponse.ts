import mongoose from "mongoose";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";
import { IKpi, IDeliverable } from "../models/Kpi";

/* --- ensure Maps survive .lean() -------------------------------- */
export function normaliseUserSpecific(kpi: IKpi) {
  if (!kpi.userSpecific) {
    kpi.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  if (!(kpi.userSpecific.statuses instanceof Map)) {
    kpi.userSpecific.statuses = new Map(Object.entries(kpi.userSpecific.statuses));
  }
  if (!(kpi.userSpecific.deliverables instanceof Map)) {
    kpi.userSpecific.deliverables = new Map(Object.entries(kpi.userSpecific.deliverables));
  }
}

/* --- always prefer caller’s personal copy ----------------------- */
export async function buildDeliverablesForCaller(
  kpi: IKpi,
  callerId: string
): Promise<IDeliverable[]> {
  const callerDels =
    kpi.userSpecific?.deliverables.get(callerId) ?? kpi.deliverables;

  // Fetch discrepancies only for this caller’s view (assigneeId!)
  const flags = await DeliverableDiscrepancy.find({
    kpiId: kpi._id,
    assigneeId: callerId   // ⭐️ filter by assigneeId!
  }).lean();

  const byIdx = new Map(
    flags.map((f) => [
      f.deliverableIndex,
      {
        status: f.resolved ? "resolved" : "open",
        meetingBooked: !!f.meeting,
        reason: f.reason
      }
    ])
  );

  return callerDels.map((d, i) => ({
    ...d,
    discrepancy: byIdx.get(i)
  }));
}
