import DeliverableDiscrepancy from "../../../models/DeliverableDiscrepancy";
import type { IKpi, IScoreSubmission } from "../../../models/Kpi";

/* ───────────────── helpers ───────────────── */

function toEntries<V = any>(m: any): [string, V][] {
  if (!m) return [];
  if (m instanceof Map) return Array.from(m.entries()).map(([k, v]) => [String(k), v] as [string, V]);
  return Object.entries(m) as [string, V][];
}
function getUserSlice(kpi: IKpi, userId: string): any[] {
  const entries = toEntries<any[]>(kpi.userSpecific?.deliverables);
  const arr = entries.find(([id]) => String(id) === String(userId))?.[1];
  return Array.isArray(arr) ? arr : [];
}
function findByDeliverableId(arr: any[], deliverableId: any) {
  return (
    arr.find(
      (d) =>
        String(d?.deliverableId) === String(deliverableId) ||
        String(d?._id) === String(deliverableId)
    ) || null
  );
}
function asArr<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}
type OccurrenceView = {
  periodLabel: string;
  dueDate?: Date;
  status?: "Pending" | "In Progress" | "Completed" | "Approved";
  evidence?: string[];
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;
  // New: per-occurrence discrepancy – optional, won’t break existing consumers
  discrepancy?: {
    status: "open" | "resolved";
    reason: string;
    resolutionNotes?: string | null;
    meetingBooked: boolean;
  };
};
function byLabel<T extends { periodLabel?: string; label?: string }>(list: T[]) {
  const map = new Map<string, T>();
  for (const o of list || []) {
    const lbl = o?.periodLabel ?? o?.label ?? "";
    if (lbl) map.set(lbl, o);
  }
  return map;
}

/* flatten Map -> plain object for JSON */
const toStringKeyEntries = <V = any>(m: any): [string, V][] => {
  if (!m) return [];
  if (m instanceof Map) return Array.from(m.entries()).map(([k, v]) => [String(k), v] as [string, V]);
  return Object.entries(m) as [string, V][];
};
const toPlainObject = <V = any>(m: any): Record<string, V> => Object.fromEntries(toStringKeyEntries<V>(m));

/* date utils (no external deps) */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function ym(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
function yOnly(d: Date) {
  return `${d.getFullYear()}`;
}
function startOfWeekISO(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay() || 7; // Sun=0 => 7
  if (day !== 1) dt.setDate(dt.getDate() - (day - 1));
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function endOfWeekISO(d: Date) {
  const s = startOfWeekISO(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
function isoWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}
function periodLabelFor(pattern: string, base: Date) {
  const p = (pattern || "").toLowerCase();
  if (p === "daily") return ymd(base);
  if (p === "weekly") {
    const { year, week } = isoWeekNumber(base);
    return `${year}-W${pad2(week)}`;
  }
  if (p === "monthly") return ym(base);
  if (p === "yearly") return yOnly(base);
  return "";
}
function dueDateFor(pattern: string, base: Date) {
  const p = (pattern || "").toLowerCase();
  if (p === "daily") {
    const e = new Date(base);
    e.setHours(23, 59, 59, 999);
    return e;
  }
  if (p === "weekly") return endOfWeekISO(base);
  if (p === "monthly") {
    const e = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
    return e;
  }
  if (p === "yearly") return new Date(base.getFullYear(), 11, 31, 23, 59, 59, 999);
  return undefined;
}

/** seed a minimal base occurrence (today/week/month/year) for recurring */
function expandBaseOccurrences(tpl: any): OccurrenceView[] {
  if (!tpl?.isRecurring) return [];
  const now = new Date();
  const label = periodLabelFor(tpl.recurrencePattern, now);
  if (!label) return [];
  return [{ periodLabel: label, dueDate: dueDateFor(tpl.recurrencePattern, now) }];
}

/* ───────────────── builder ───────────────── */

/**
 * Build deliverables as seen by `callerId` (viewed user on user board).
 * - Start from templates
 * - Seed occurrences for recurring items
 * - Overlay ONLY caller's per-user data (scores/evidence) by periodLabel
 * - Creator reviews are read from the assignee slice
 * - Discrepancies are scoped to this assignee and to each occurrence (if recurring)
 */
export async function buildCallerResponse(kpi: IKpi, callerId: string) {
  const callerStatus =
    (kpi.userSpecific?.statuses instanceof Map
      ? kpi.userSpecific.statuses.get(callerId)
      : (kpi as any).userSpecific?.statuses?.[callerId]) ?? kpi.status;

  // ⬇️ Scope discrepancies to this KPI AND this assignee (callerId).
  // If you want only active flags on the board, uncomment resolved:false below.
  const discrepancies = await DeliverableDiscrepancy.find({
    kpiId: kpi._id,
    assigneeId: callerId,
    // resolved: false,
  }).lean();

  // Index by deliverableIndex + occurrenceLabel ("__root__" for non-recurring)
  const discByKey = new Map<string, {
    status: "open" | "resolved";
    reason: string;
    resolutionNotes?: string | null;
    meetingBooked: boolean;
  }>();
  for (const d of discrepancies) {
    const occ = (d as any).occurrenceLabel ?? "__root__";
    const key = `${(d as any).deliverableIndex}|${occ}`;
    discByKey.set(key, {
      status: (d as any).resolved ? "resolved" : "open",
      reason: (d as any).reason,
      resolutionNotes: (d as any).resolutionNotes ?? null,
      meetingBooked: !!(d as any)?.meeting,
    });
  }

  const assigneeSlice = getUserSlice(kpi, callerId);

  const deliverables = asArr<any>(kpi.deliverables).map((tpl: any, index: number) => {
    const assigneeState = findByDeliverableId(assigneeSlice, tpl._id);

    // 1) seed base occurrences for recurring (at least one visible period)
    const base: OccurrenceView[] = expandBaseOccurrences(tpl);

    // 2) overlay: index any user-specific occurrences by label
    const userOccs = (asArr<any>(assigneeState?.occurrences) ?? []) as OccurrenceView[];
    const assByLbl = byLabel<OccurrenceView>(userOccs);

    // 3) merge base + user labels, and attach per-occurrence discrepancy (if any)
    const labels = new Set<string>([...base.map((b) => b.periodLabel), ...assByLbl.keys()]);
    const mergedOccurrences: OccurrenceView[] = Array.from(labels).map((lbl) => {
      const a = assByLbl.get(lbl);
      const b = base.find((x) => x.periodLabel === lbl);
      const discrepancy = discByKey.get(`${index}|${lbl}`); // ⬅️ per-period flag
      return {
        periodLabel: lbl,
        dueDate: a?.dueDate ?? b?.dueDate,
        status: a?.status ?? "Pending",
        evidence: asArr<string>(a?.evidence),
        assigneeScore: a?.assigneeScore,
        creatorScore: a?.creatorScore, // creator review stored under assignee slice
        discrepancy, // optional
      };
    });

    const rootDiscrepancy = discByKey.get(`${index}|__root__`); // ⬅️ deliverable-level (non-recurring)

    return {
      _id: tpl._id,
      title: tpl.title,
      action: tpl.action,
      indicator: tpl.indicator,
      performanceTarget: tpl.performanceTarget,
      timeline: tpl.timeline,
      priority: tpl.priority,
      isRecurring: !!tpl.isRecurring,
      recurrencePattern: tpl.recurrencePattern,
      promoteGlobally: !!tpl.promoteGlobally,
      weight: tpl.weight,

      status: assigneeState?.status ?? "Pending",

      // UI-facing, derived strictly from assignee slice
      assigneeScore: assigneeState?.assigneeScore,
      creatorScore: assigneeState?.creatorScore,
      hasSavedCreator: !!assigneeState?.creatorScore,
      evidence: asArr<string>(assigneeState?.evidence),

      // ✅ occurrences now present for recurring deliverables even without prior saves
      occurrences: mergedOccurrences,

      // deliverable-level discrepancy (non-recurring) – keeps your old shape working
      discrepancy: rootDiscrepancy,
      _index: index,
    };
  });

  const kpiObj = (kpi as any).toObject ? (kpi as any).toObject() : kpi;

  return {
    ...kpiObj,
    status: callerStatus,
    deliverables,
    isCreator: String(kpi.createdBy) === String(callerId),
    lastUpdatedBy: (kpi as any).lastUpdatedBy,
  };
}
