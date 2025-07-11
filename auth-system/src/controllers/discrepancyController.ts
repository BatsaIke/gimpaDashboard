// src/controllers/discrepancyController.ts
import { Request, Response } from "express";
import Discrepancy from "../models/DeliverableDiscrepancy";
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

    // ──────────────────────── Privilege checks ────────────────────────
    const role = (req.authUser?.role || "").toLowerCase();
    const isSuperAdmin = role.includes("super") && role.includes("admin");

    let isKpiCreator = false;
    if (filter.kpiId) {
      const kpiMatch = await Kpi.exists({
        _id: filter.kpiId,
        createdBy: req.authUser!._id,
      });
      isKpiCreator = !!kpiMatch; // ← convert to boolean
    }

    // ──────────────────────── Apply filters ───────────────────────────
    if (assigneeId) {
      filter.assigneeId = assigneeId; // Explicit query param wins
    } else if (!isSuperAdmin && !isKpiCreator) {
      filter.assigneeId = req.authUser!._id; // Ordinary users see only their discrepancies
    }

    // ──────────────────────── Fetch and populate ──────────────────────
    const docs = await Discrepancy.find(filter)
      .populate("kpiId", "name deliverables")
      .populate("assigneeId", "fullName username email")
      .populate("meeting.bookedBy", "fullName username email")
      .populate("history.by", "fullName username email")
      .lean();

    res.json(docs);
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
export const resolveDiscrepancy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    let { resolutionNotes } = req.body;
    const userId = req.authUser!._id;

    if (typeof resolutionNotes === "object" && resolutionNotes !== null) {
      resolutionNotes = (resolutionNotes as any).resolutionNotes;
    }
    if (typeof resolutionNotes !== "string" || !resolutionNotes.trim()) {
      return void res.status(400).json({ message: "Resolution notes are required." });
    }

    const discrepancy = await Discrepancy.findById(id);
    if (!discrepancy) return void res.status(404).json({ message: "Discrepancy not found." });

    const kpi = await Kpi.findById(discrepancy.kpiId).select("createdBy");
    if (!kpi) return void res.status(404).json({ message: "Related KPI not found." });
    if (String(kpi.createdBy) !== String(userId)) {
      return void res.status(403).json({ message: "Only the KPI creator can resolve this discrepancy." });
    }

    discrepancy.resolved        = true;
    discrepancy.resolutionNotes = resolutionNotes.trim();
    discrepancy.history.push({ action: "resolved", by: userId, timestamp: new Date() });

    await discrepancy.save({ validateBeforeSave: false });

    const populated = await Discrepancy.findById(id)
      .populate({ path: "history.by", select: "fullName username email" })
      .lean();

    res.status(200).json(populated);
  } catch (err: any) {
    console.error("resolveDiscrepancy error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

