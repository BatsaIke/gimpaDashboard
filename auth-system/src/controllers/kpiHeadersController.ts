// controllers/kpiHeaderController.ts
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import KpiHeader from "../models/KpiHeaders";
import Kpi, { IKpi } from "../models/Kpi";
import { AuthRequest } from "../types/types";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy"; 
import { buildDeliverablesForCaller, normaliseUserSpecific } from "../utils/kpiResponse";


/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const kpiMatchForCaller = (
  callerId: Types.ObjectId,
  callerRole: string,
  callerDept?: Types.ObjectId | null,
  isRector = false,
) => {
  if (isRector) return {}; // Rector sees everything

  const $or: any[] = [
    { createdBy: callerId },
    { assignedUsers: callerId },
    { assignedRoles: callerRole },
  ];
  if (callerDept) $or.push({ departments: callerDept });
  return { $or };
};

/* ------------------------------------------------------------------ */
/*  Controller functions                                              */
/* ------------------------------------------------------------------ */

export const createKpiHeader = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const createdBy = req.authUser?._id;  // always present if authMiddleware did its job

    if (!createdBy) {
     res.status(400).json({ message: "Creator information is missing" });
      return 
    }

    const header = await KpiHeader.create({ name, createdBy });

    const populated = await header.populate({
      path: "createdBy",
      select: "username email role fullName",
    });

    res.status(201).json({ message: "KPI header created successfully", header: populated });
  } catch (err) {
    console.error("createKpiHeader error:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};


/* ──────────────────────────────────────────────────────────────── */
/* GET /api/v1/kpi-headers                                          */
/* ──────────────────────────────────────────────────────────────── */



/* Helper function omitted for brevity (kpiMatchForCaller) */

export const getKpiHeaders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, _id: callerId, department: callerDept } = req.authUser!;
    const isSuperAdmin = role === "Super Admin";
    const viewUserIdParam = req.query.viewUserId as string | undefined;
    const viewUserId =
      viewUserIdParam && mongoose.Types.ObjectId.isValid(viewUserIdParam)
        ? new mongoose.Types.ObjectId(viewUserIdParam)
        : null;

    // Security check
    if (
      viewUserId &&
      String(viewUserId) !== String(callerId) &&
      !isSuperAdmin &&
      role !== "Rector"
    ) {
      return void res
        .status(403)
        .json({ message: "Not authorised to view this user’s KPIs" });
    }

    let depId: Types.ObjectId | null = null;
    if (callerDept) {
      const id = typeof callerDept === "object" ? callerDept._id : callerDept;
      if (mongoose.Types.ObjectId.isValid(String(id))) {
        depId = new mongoose.Types.ObjectId(String(id));
      }
    }

    const kpiMatch = kpiMatchForCaller(
      new mongoose.Types.ObjectId(String(callerId)),
      role,
      depId,
      isSuperAdmin
    );

    const rawHeaders = await KpiHeader.find()
      .populate("createdBy", "username fullName email role")
      .populate({
        path: "kpis",
        match: kpiMatch,
        populate: [
          { path: "departments", select: "name description" },
          { path: "assignedUsers", select: "username fullName email role employeeId" },
          { path: "createdBy", select: "username fullName email role" },
          { path: "header", select: "name description" }
        ]
      })
      .lean()
      .exec();

    const enrichedHeaders = await Promise.all(
      rawHeaders.map(async (header) => {
        const enrichedKpis = await Promise.all(
          (header.kpis || []).map(async (kpi: any) => {
            normaliseUserSpecific(kpi);

            const isCreator =
              String(
                typeof kpi.createdBy === "object"
                  ? kpi.createdBy._id
                  : kpi.createdBy
              ) === String(callerId);

            const isAssigned =
              (kpi.assignedUsers || []).some(
                (u: any) => String(u._id) === String(callerId)
              ) ||
              (kpi.assignedRoles || []).includes(role) ||
              (kpi.departments || []).some(
                (d: any) => String(d._id) === String(callerDept)
              );

            const perspectiveId = viewUserId ? viewUserId : callerId;

            // 🔥 Build the merged deliverables for the perspective (assignee or creator)
            const mergedDeliverables = await buildDeliverablesForCaller(
              kpi,
              String(perspectiveId)
            );

            // 🔥 If creator, also get assignee deliverables (of first assignee or whoever you want)
            let assigneeDeliverables: any[] | undefined = undefined;
            if (isCreator) {
              const firstAssignee = (kpi.assignedUsers || [])[0]?._id;
              if (firstAssignee) {
                assigneeDeliverables = await buildDeliverablesForCaller(
                  kpi,
                  String(firstAssignee)
                );
              }
            }

            // 🔥 Discrepancy flags
            const flags = await DeliverableDiscrepancy.find({
              kpiId: kpi._id
            }).lean();

            const flagMap = new Map(
              flags.map((f) => [
                f.deliverableIndex,
                {
                  status: f.resolved ? "resolved" : "open",
                  meetingBooked: !!f.meeting,
                  reason: f.reason,
                  resolutionNotes: f.resolutionNotes ?? null
                }
              ])
            );

            const deliverables = mergedDeliverables.map((d: any, idx: number) => ({
              ...d,
              discrepancy: flagMap.get(idx)
            }));

            return {
              ...kpi,
              isCreator,
              isAssignedUser: isAssigned,
              deliverables,
              assigneeDeliverables: isCreator ? assigneeDeliverables : undefined
            };
          })
        );

        return { ...header, kpis: enrichedKpis };
      })
    );

    res.status(200).json(enrichedHeaders);
  } catch (err: any) {
    console.error("getKpiHeaders error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};








export const updateKpiHeader = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const header = await KpiHeader.findByIdAndUpdate(id, { name }, { new: true });
    if (!header) {
      return void res.status(404).json({ message: "KPI header not found" });
    }

    res
      .status(200)
      .json({ message: "KPI header updated successfully", header });
  } catch (err) {
    console.error("updateKpiHeader error:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

export const deleteKpiHeader = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const header = await KpiHeader.findById(id);
    if (!header) {
      return void res.status(404).json({ message: "KPI header not found" });
    }

    const kpiIds = header.kpis ?? [];
    if (kpiIds.length) await Kpi.deleteMany({ _id: { $in: kpiIds } });

    await header.deleteOne();

    res.status(200).json({
      message: "KPI header and associated KPIs removed",
      deletedKpisCount: kpiIds.length,
    });
  } catch (err) {
    console.error("deleteKpiHeader error:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};
