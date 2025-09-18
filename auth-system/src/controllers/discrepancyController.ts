// src/controllers/discrepancyController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Discrepancy, { IDiscrepancy, IScoreSnapshot } from "../models/DeliverableDiscrepancy";
import { AuthRequest } from "../types/types";
import Kpi from "../models/Kpi";

/**
 * GET /api/v1/discrepancies
 * GET /api/v1/discrepancies/:kpiId
 */
/**
 * GET /api/v1/discrepancies
 * GET /api/v1/discrepancies/:kpiId
 */
// src/controllers/discrepancyController.ts
// controllers/discrepancyController.ts
export const listDiscrepancies = async (req: AuthRequest, res: Response) => {
  try {
    const { kpiId: paramId } = req.params;
    const { kpiId: queryId, assigneeId } = req.query as {
      kpiId?: string;
      assigneeId?: string;
    };

    const filter: any = {};
    if (paramId) filter.kpiId = paramId;
    if (queryId) filter.kpiId = queryId;

    // ── Privilege checks ──────────────────────────────────────────────
    const role = (req.authUser?.role || "").toLowerCase();
    const isSuperAdmin = role.includes("super") && role.includes("admin");

    let isKpiCreator = false;
    if (filter.kpiId) {
      isKpiCreator = !!(await Kpi.exists({ _id: filter.kpiId, createdBy: req.authUser!._id }));
    }

    // ── Apply filters ─────────────────────────────────────────────────
    if (assigneeId) {
      filter.assigneeId = assigneeId;
    } else if (!isSuperAdmin && !isKpiCreator) {
      filter.assigneeId = req.authUser!._id;
    }

    console.log(`[Backend: listDiscrepancies] Applying filter: ${JSON.stringify(filter)}`);

    // ── Fetch & populate ─────────────────────────────────────────────
    const docs = await Discrepancy.find(filter)
      .populate("kpiId", "name deliverables")
      .populate("assigneeId", "fullName username email")
      .populate("meeting.bookedBy", "fullName username email")
      .populate("history.by", "fullName username email")
      .sort({ flaggedAt: -1 })
      // IMPORTANT: include virtuals when using lean
      .lean({ virtuals: true });

    console.log(`[Backend: listDiscrepancies] Found discrepancies:`, docs);

    // ── Final shape for UI (back‑compat + safety) ─────────────────────
    const normalized = docs.map((d: any) => {
      // In case some legacy records used "delIndex", ensure deliverableIndex exists
      const deliverableIndex =
        typeof d.deliverableIndex === "number"
          ? d.deliverableIndex
          : (typeof d.delIndex === "number" ? d.delIndex : null);

      // Prefer virtuals; fall back if needed
      const meetingBooked =
        typeof d.meetingBooked === "boolean"
          ? d.meetingBooked
          : !!d.meeting ||
            !!(Array.isArray(d.history) && d.history.some((h: any) => h?.action === "meeting-booked"));

      const reason = d.reasonEffective || d.reason || "Score discrepancy detected";
      const resolutionNotes = d.resolutionNotesEffective || d.resolutionNotes || d.resolution || "";

      return {
        ...d,
        deliverableIndex,
        meetingBooked,
        reason,
        resolutionNotes
      };
    });

    res.json(normalized);
  } catch (err: any) {
    console.error("listDiscrepancies error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





/**
 * PUT /api/v1/discrepancies/:id/book
 */
export const bookMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, notes } = req.body;
    const userId = req.authUser!._id;

    const updated = await Discrepancy.findByIdAndUpdate(
      id,
      {
        meeting: {
          bookedBy: userId,
          timestamp: new Date(date),
          notes: notes || ""
        },
        $push: {
          history: {
            action: "meeting-booked",
            by: userId,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
      .populate({ path: "meeting.bookedBy", select: "fullName username email" })
      .lean();

    if (!updated) return void res.status(404).json({ message: "Flag not found" });

    res.status(200).json(updated);
  } catch (err: any) {
    console.error("bookMeeting error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};






/**
 * PUT /api/v1/discrepancies/:id/resolve
 * Only the creator of the KPI can resolve the discrepancy and must provide resolution notes.
 */
// src/controllers/discrepancyController.ts


// controllers/discrepancyController.ts (replace resolveDiscrepancy)


export const resolveDiscrepancy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolutionNotes, newScore } = req.body as {
      resolutionNotes?: string;
      newScore?: string | number;
    };

    // ---- validate
    if (!resolutionNotes?.trim()) {
      res.status(400).json({ message: "Resolution notes are required." });
      return;
    }
    const scoreNum = Number(newScore);
    if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      res.status(400).json({ message: "newScore must be 0–100." });
      return;
    }

    // ---- fetch
    const discrepancy = await Discrepancy.findById(id);
    if (!discrepancy) { res.status(404).json({ message: "Discrepancy not found." }); return; }

    const kpi = await Kpi.findById(discrepancy.kpiId);
    if (!kpi) { res.status(404).json({ message: "Related KPI not found." }); return; }

    const callerId = String(req.authUser!._id);
    if (String(kpi.createdBy) !== callerId) {
      res.status(403).json({ message: "Only the KPI creator can resolve." });
      return;
    }

    // ---- build snapshot
    const docPath  = req.file ? `/uploads/supporting/${req.file.filename}` : undefined;
    const snapshot: IScoreSnapshot = {
      value: scoreNum,
      notes: resolutionNotes.trim(),
      supportingDocuments: docPath ? [docPath] : [],
      enteredBy: req.authUser!._id as unknown as mongoose.Types.ObjectId,
      timestamp: new Date(),
    };

    // ---- update discrepancy document
    discrepancy.previousScore   = discrepancy.creatorScore;
    discrepancy.resolvedScore   = snapshot;
    discrepancy.creatorScore    = snapshot;
    discrepancy.resolutionNotes = resolutionNotes.trim();
    discrepancy.resolved        = true;
    discrepancy.history.push({ action: "resolved", by: req.authUser!._id as any, timestamp: new Date() });

    // mark optional paths as modified
    discrepancy.markModified("previousScore");
    discrepancy.markModified("resolvedScore");
    discrepancy.markModified("creatorScore");
    discrepancy.markModified("resolutionNotes");
    discrepancy.markModified("resolved");
    discrepancy.markModified("history");

    await discrepancy.save({ validateBeforeSave: false });

    // ---- update KPI per-user state (assignee + mirror to creator view)
    const delIndex = discrepancy.deliverableIndex;
    const template = kpi.deliverables[delIndex];
    if (!template) {
      // Unusual but don't hard-fail; just return discrepancy updated
      const populated = await Discrepancy.findById(id)
        .populate([
          { path: "history.by",              select: "fullName username email" },
          { path: "previousScore.enteredBy", select: "fullName username email" },
          { path: "resolvedScore.enteredBy", select: "fullName username email" },
          { path: "creatorScore.enteredBy",  select: "fullName username email" },
        ])
        .lean();
      res.status(200).json(populated);
      return;
    }

    // normalize userSpecific
    (kpi as any).normaliseUserSpecific();

    const assigneeId = String(discrepancy.assigneeId);
    const creatorKey = String(kpi.createdBy);

    (kpi as any).ensureUserSpecific(assigneeId);
    (kpi as any).ensureUserSpecific(creatorKey);

    const aView = kpi.userSpecific!.deliverables.get(assigneeId)!;
    const cView = kpi.userSpecific!.deliverables.get(creatorKey)!;

    const deliverableId = String(template._id);

    const findState = (arr: any[]) =>
      arr.find((s) => String(s.deliverableId) === deliverableId);

    const aState = findState(aView);
    const cState = findState(cView);

    if (aState && cState) {
      const occLabel = discrepancy.occurrenceLabel || null;

      if (occLabel) {
        // occurrence-level
        const ensureOcc = (state: any) => {
          state.occurrences = state.occurrences || [];
          let occ = state.occurrences.find((o: any) => o?.periodLabel === occLabel);
          if (!occ) {
            occ = { periodLabel: occLabel, status: "Pending", evidence: [] };
            state.occurrences.push(occ);
          }
          return occ;
        };

        const aOcc = ensureOcc(aState);
        const cOcc = ensureOcc(cState);

        aOcc.creatorScore = snapshot;
        cOcc.creatorScore = snapshot;
        // Optionally move status forward on resolve
        if (aOcc.status !== "Approved") aOcc.status = "Completed";
        if (cOcc.status !== "Approved") cOcc.status = "Completed";
      } else {
        // deliverable-level
        aState.creatorScore = snapshot;
        cState.creatorScore = snapshot;
        if (aState.status !== "Approved") aState.status = "Completed";
        if (cState.status !== "Approved") cState.status = "Completed";
      }

      kpi.markModified("userSpecific.deliverables");
      await kpi.save();
    }

    // ---- respond (discrepancy with populations)
    const populated = await Discrepancy.findById(id)
      .populate([
        { path: "history.by",              select: "fullName username email" },
        { path: "previousScore.enteredBy", select: "fullName username email" },
        { path: "resolvedScore.enteredBy", select: "fullName username email" },
        { path: "creatorScore.enteredBy",  select: "fullName username email" },
      ])
      .lean();

    res.status(200).json(populated);
  } catch (err: any) {
    console.error("resolveDiscrepancy error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




export const checkAndFlagDiscrepancy = async (
  kpiId: mongoose.Types.ObjectId,
  deliverableIndex: number,
  assigneeId: mongoose.Types.ObjectId,
  occurrenceLabel: string | null,
  assigneeScore: IScoreSnapshot,
  creatorScore: IScoreSnapshot,
  reason: string = "Score below threshold"
): Promise<IDiscrepancy | null> => {
  try {
    const match = { kpiId, deliverableIndex, assigneeId, occurrenceLabel: occurrenceLabel ?? null };

    const existing = await Discrepancy.findOne(match);
    if (existing) {
      const wasResolved = !!existing.resolved;
      existing.assigneeScore = assigneeScore;
      existing.creatorScore  = creatorScore;
      existing.reason        = reason;
      existing.flaggedAt     = new Date();
      existing.resolved      = false;
      existing.history.push({
        action: wasResolved ? "re-flagged" : "updated",
        by: creatorScore.enteredBy,
        timestamp: new Date(),
      });
      existing.markModified("assigneeScore");
      existing.markModified("creatorScore");
      existing.markModified("reason");
      existing.markModified("flaggedAt");
      existing.markModified("resolved");
      await existing.save({ validateBeforeSave: false });
      return existing.toObject() as any;
    }

    const created = await Discrepancy.create({
      ...match,
      assigneeScore,
      creatorScore,
      reason,
      flaggedAt: new Date(),
      resolved: false,
      history: [{ action: "flagged", by: creatorScore.enteredBy, timestamp: new Date() }],
    });
    return created.toObject() as any;
  } catch (err: any) {
    console.error("Error flagging discrepancy:", err);
    return null;
  }
};
