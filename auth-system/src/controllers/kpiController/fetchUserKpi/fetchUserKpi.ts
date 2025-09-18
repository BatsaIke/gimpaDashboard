import { Request, Response } from "express";
import mongoose from "mongoose";
import Kpi from "../../../models/Kpi";
import Discrepancy from "../../../models/DeliverableDiscrepancy";
import { toObjectId } from "../../../utils/mongo";
import { AuthRequest } from "../../../types/types";
import { normaliseUserSpecific } from "../../../utils/kpiUtils";
import { buildCallerResponse } from "../updateKpi/buildResponse";
import { toPlainObject } from "../kpiController";

type DiscrepancySummary = {
  hasOpen: boolean;
  openCount: number;
  latestId?: string;
  latestAt?: string; // ISO
};

const summarize = (items: any[]): DiscrepancySummary => {
  if (!items?.length) return { hasOpen: false, openCount: 0 };
  const open = items.filter((d) => !d.resolved);
  const latest = [...items].sort(
    (a, b) =>
      new Date(b.flaggedAt || b.createdAt || 0).getTime() -
      new Date(a.flaggedAt || a.createdAt || 0).getTime()
  )[0];
  return {
    hasOpen: open.length > 0,
    openCount: open.length,
    latestId: latest?._id ? String(latest._id) : undefined,
    latestAt: latest?.flaggedAt ? new Date(latest.flaggedAt).toISOString() : undefined,
  };
};

// ---------- score-based fallback checkers ----------
const val = (x: any): number | undefined =>
  typeof x === "number"
    ? x
    : typeof x?.value === "number"
    ? x.value
    : undefined;

const hasScoreDiscrepancyDeliverable = (del: any): boolean => {
  const a = val(del?.assigneeScore);
  const c = val(del?.creatorScore);
  // Fallback rule: if creator has reviewed (<60) and assignee has a score → flag
  return typeof c === "number" && typeof a === "number" && c < 60;
};

const hasScoreDiscrepancyOccurrence = (occ: any): boolean => {
  const a = val(occ?.assigneeScore);
  const c = val(occ?.creatorScore);
  return typeof c === "number" && typeof a === "number" && c < 60;
};

export const getUserKpis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params; // viewed user (assignee)
    const { year } = req.query as { year?: string };
    const { _id: callerIdRaw, role: callerRole } = req.authUser!;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const callerId = toObjectId(callerIdRaw);
    const assigneeOid = toObjectId(userId);

    // Authorization: allow self, Rector, or creator–assignee relationship
    if (String(userId) !== String(callerId) && callerRole !== "Rector") {
      const allowed = await Kpi.exists({ assignedUsers: assigneeOid, createdBy: callerId });
      if (!allowed) {
        res.status(403).json({ message: "Not authorized" });
        return;
      }
    }

    const query: any = { assignedUsers: assigneeOid };
    if (year) query.academicYear = year;

    const raw = await Kpi.find(query)
      .populate("departments", "name")
      .populate("assignedUsers", "username fullName email role employeeId")
      .populate("createdBy", "username fullName email role")
      .populate("header", "name description")
      .lean();

    // ───────────────────────── Discrepancy prefetch ─────────────────────────
    const kpiIds = raw.map((k) => k._id);
    const allDiscrepancies = await Discrepancy.find({
      kpiId: { $in: kpiIds },
      assigneeId: assigneeOid,
    })
      .select("_id kpiId deliverableIndex occurrenceLabel resolved flaggedAt createdAt")
      .lean();

    // Index by kpiId -> (deliverableIndex + occurrenceLabel) -> list
    const byKpi = new Map<string, Map<string, any[]>>();
    for (const d of allDiscrepancies) {
      const kKey = String(d.kpiId);
      const occKey = `${d.deliverableIndex}|${d.occurrenceLabel || ""}`;
      if (!byKpi.has(kKey)) byKpi.set(kKey, new Map());
      const inner = byKpi.get(kKey)!;
      if (!inner.has(occKey)) inner.set(occKey, []);
      inner.get(occKey)!.push(d);
    }

    // ───────────────────────── Build response per KPI ───────────────────────
    const kpis = await Promise.all(
      (raw as any[]).map(async (k) => {
        // normalize Map-like structures on lean object
        normaliseUserSpecific(k);

        // Build caller-shaped deliverables/occurrences
        const built = await buildCallerResponse(k as any, String(userId));

        // Attach discrepancy summaries with fallback
        const kpiDiscIndex = byKpi.get(String(k._id));

        const withDisc = (built.deliverables || []).map((del: any, dIdx: number) => {
          const baseKey = `${dIdx}|`;

          if (del.isRecurring && Array.isArray(del.occurrences) && del.occurrences.length) {
            // Per-occurrence: DB summary + score fallback
            const occs = del.occurrences.map((occ: any) => {
              const label = occ.periodLabel || occ.label || occ.occurrenceLabel || "";
              const key = `${dIdx}|${label}`;
              const dbSummary = summarize(kpiDiscIndex?.get(key) || []);
              const scoreFlag = hasScoreDiscrepancyOccurrence(occ);

              return {
                ...occ,
                discrepancy: {
                  hasOpen: dbSummary.hasOpen || scoreFlag,
                  openCount: dbSummary.openCount || (scoreFlag ? 1 : 0),
                  latestId: dbSummary.latestId,
                  latestAt: dbSummary.latestAt,
                } as DiscrepancySummary,
              };
            });

            // deliverable-level rollup considering score fallbacks
            const rollup = occs.reduce(
              (acc: { openAny: boolean; openTotal: number }, o: any) => {
                if (o.discrepancy?.hasOpen) acc.openAny = true;
                acc.openTotal += o.discrepancy?.openCount || 0;
                return acc;
              },
              { openAny: false, openTotal: 0 }
            );

            return {
              ...del,
              occurrences: occs,
              discrepancy: {
                hasOpen: rollup.openAny,
                openCount: rollup.openTotal,
              } as DiscrepancySummary,
            };
          } else {
            // Non-recurring: DB summary + score fallback
            const dbSummary = summarize(kpiDiscIndex?.get(baseKey) || []);
            const scoreFlag = hasScoreDiscrepancyDeliverable(del);

            return {
              ...del,
              discrepancy: {
                hasOpen: dbSummary.hasOpen || scoreFlag,
                openCount: dbSummary.openCount || (scoreFlag ? 1 : 0),
                latestId: dbSummary.latestId,
                latestAt: dbSummary.latestAt,
              } as DiscrepancySummary,
            };
          }
        });

        // Flatten userSpecific maps for JSON safety
        const plainStatuses = toPlainObject(k.userSpecific?.statuses);
        const plainDeliverables = toPlainObject(k.userSpecific?.deliverables);

        return {
          ...built,
          deliverables: withDisc, // ← now enriched with discrepancy summaries + fallbacks
          userSpecific: {
            statuses: plainStatuses,
            deliverables: plainDeliverables,
          },
          assigneeDeliverables: withDisc,
        };
      })
    );

    res.status(200).json(kpis);
  } catch (err) {
    console.error("Error fetching user KPIs:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};
