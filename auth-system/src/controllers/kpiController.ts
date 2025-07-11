

import { Request, Response } from "express";
import Kpi, { IKpi,IDeliverable } from "../models/Kpi";
import User from "../models/User";
import { AuthRequest } from "../types/types";
import KpiHeader from "../models/KpiHeaders"; // ✅ Import the KpiHeader model

import mongoose from "mongoose";
import { log } from "console";
import { calculateKpiPermissions } from "../utils/kpiPermissions";
import { updateKpiDeliverables, updateKpiStatus } from "../utils/kpiUtils";
import { maybeFlagDiscrepancy } from "../utils/discrepancyUtils";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";
import { buildDeliverablesForCaller, normaliseUserSpecific } from "../utils/kpiResponse";
import { canAssignTo, SystemRole } from "../utils/rolesAccess";
import Department from "../models/Department";



type LeanKpi = Omit<IKpi, "_id"> & {
  _id: mongoose.Types.ObjectId | string;
  departments: { _id: mongoose.Types.ObjectId; name: string }[];
  assignedUsers: {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    role: string;
    fullName?: string;
    employeeId?: string;
  }[];
  createdBy: { 
    _id: mongoose.Types.ObjectId;
    fullName?: string; 
    email: string; 
    role: string 
  };
  header?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
  };
};

// kpiController.ts
const DELIVERABLE_STATUSES = ["Pending", "In Progress", "Completed", "Approved"];

export const getDeliverableStatuses = (req: AuthRequest, res: Response) => {
  // Optionally check user role, etc.
  res.json({ statuses: DELIVERABLE_STATUSES });
};


/**
 * @route   GET /api/v1/kpis
 * @desc    Fetch all KPIs (filtered by user role)
 * @access  Private (Authenticated users only)
 */


export const getAllKpis = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, _id: userId } = req.authUser!;
    const userIdStr = String(userId);
    const { department: userDepartment } = req.authUser!;

    /* ---------- build query ---------- */
    let depId: mongoose.Types.ObjectId | null = null;
    if (userDepartment) {
      const id = typeof userDepartment === "object" ? userDepartment._id : userDepartment;
      if (mongoose.Types.ObjectId.isValid(id)) depId = new mongoose.Types.ObjectId(id);
    }

    let query: any = {};
    if (role !== "Rector") {
      query = {
        $or: [
          { assignedUsers: userId },
          ...(depId ? [{ departments: depId }] : []),
          ...(role ? [{ assignedRoles: role }] : [])
        ]
      };
    }

    /* ---------- fetch KPIs with full population ---------- */
    const raw = await Kpi.find(query)
      .populate({
        path: "departments",
        select: "name"
      })
      .populate({
        path: "assignedUsers",
        select: "username fullName email role employeeId"
      })
      .populate({
        path: "createdBy",
        select: "fullName email role"
      })
      .populate({
        path: "header",
        select: "name description" // Include header name and description
      })
      .lean()
      .exec();

    const kpis = raw as unknown as LeanKpi[];

    /* ---------- rest of your existing code ---------- */
    const enriched = await Promise.all(
      kpis.map(async (kpi) => {
        const { isCreator, isAssignedUser } = calculateKpiPermissions(
          kpi,
          userIdStr,
          role,
          depId
        );

        const flags = await DeliverableDiscrepancy.find({ kpiId: kpi._id })
          .lean()
          .exec();

        const flagMap = new Map(
          flags.map((f) => [
            f.deliverableIndex,
            {
              status: f.resolved ? "resolved" : "open",
              meetingBooked: !!f.meeting,
              reason: f.reason
            }
          ])
        );

        const deliverablesWithFlags = (kpi as any).deliverables?.map(
          (d: any, idx: number) => ({ ...d, discrepancy: flagMap.get(idx) })
        );

        return {
          ...kpi,
          deliverables: deliverablesWithFlags,
          isCreator,
          isAssignedUser
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ message: "Server error while fetching KPIs" });
  }
};







/**
 * @route   POST /api/v1/kpis
 * @desc    Create a new KPI with an optional file
 * @access  Private
 */



// controllers/kpiController.ts  (only the createKpi handler shown)

export const createKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    /* ───────────────────── Parse payload ───────────────────── */
    const { name, description, header } = req.body;

    const departments: string[] = req.body.departments ? JSON.parse(req.body.departments) : [];
    const assignedUsers: string[] = req.body.assignedUsers ? JSON.parse(req.body.assignedUsers) : [];
    const assignedRoles: string[] = req.body.assignedRoles ? JSON.parse(req.body.assignedRoles) : [];
    const deliverables: any[] = req.body.deliverables ? JSON.parse(req.body.deliverables) : [];

    /* ──────────────────── Creator context ──────────────────── */
    const createdBy = req.authUser?._id;
    const callerRole = req.authUser?.role as SystemRole;

    if (!createdBy || !callerRole) {
      res.status(400).json({ message: "Creator information is missing." });
      return;
    }

    const createdByModel = "User";

    /* ─────────────── Basic required-field guard ─────────────── */
    if (!name || !header) {
      res.status(400).json({ message: "Name and header are required." });
      return;
    }

    if (departments.length === 0 && assignedUsers.length === 0 && assignedRoles.length === 0) {
      res.status(400).json({ message: "Must assign to at least one department, user, or role." });
      return;
    }

    /* ─────────────── Validate references exist ─────────────── */
    // Validate departments exist
    const existingDeptCount = await Department.countDocuments({ 
      _id: { $in: departments.map(id => new mongoose.Types.ObjectId(id)) } 
    });
    if (existingDeptCount !== departments.length) {
      res.status(400).json({ message: "One or more departments don't exist" });
      return;
    }

    // Validate header exists
    const headerExists = await KpiHeader.exists({ _id: header });
    if (!headerExists) {
      res.status(400).json({ message: "Specified header doesn't exist" });
      return;
    }

    /* ───────────────── Role/Person access control ───────────────── */
    const forbiddenRoles = assignedRoles.filter(
      (r) => !canAssignTo(callerRole, r as SystemRole)
    );
    if (forbiddenRoles.length) {
      res.status(403).json({
        message: "You cannot assign KPIs to these roles",
        roles: forbiddenRoles,
      });
      return;
    }

    const userDocs = await User.find(
      { _id: { $in: assignedUsers } },
      { role: 1 }
    ).lean();

    const forbiddenUsers = userDocs.filter(
      (u) => !canAssignTo(callerRole, u.role as SystemRole)
    );
    if (forbiddenUsers.length) {
      res.status(403).json({
        message: "You cannot assign KPIs to some selected users",
        userIds: forbiddenUsers.map((u) => u._id),
      });
      return;
    }

    /* ───────────────────── File processing ───────────────────── */
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const fieldName = file.fieldname;
        const indexStr = fieldName.split("_")[1];
        const index = parseInt(indexStr, 10);

        if (!isNaN(index) && deliverables[index]) {
          deliverables[index].evidence = [
            ...(deliverables[index].evidence || []),
            `/uploads/evidence/${file.filename}`,
          ];
        }
      });
    }

    /* ───────────────────── KPI creation ───────────────────── */
    const newKpi = new Kpi({
      name,
      description,
      header: new mongoose.Types.ObjectId(header),
      departments: departments.map(id => new mongoose.Types.ObjectId(id)),
      assignedUsers: assignedUsers.map(id => new mongoose.Types.ObjectId(id)),
      assignedRoles,
      deliverables,
      createdBy,
      createdByModel,
    });

    const savedKpi = await newKpi.save();
    
    // Update header's kpis array
    await KpiHeader.findByIdAndUpdate(header, { $push: { kpis: savedKpi._id } });

    /* ──────────────────── Populate response ──────────────────── */
    const populatedKpi = await Kpi.findById(savedKpi._id)
      .populate('departments', 'name description')
      .populate('assignedUsers', 'username fullName email role employeeId')
      .populate('header', 'name description')
      .populate('createdBy', 'username fullName email role')
      .lean();

    res.status(201).json({ 
      message: "KPI created successfully", 
      kpi: populatedKpi 
    });
  } catch (error) {
    console.error("Error creating KPI:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};



/**
 * @route   PATCH /api/v1/kpis/:id
 * @desc    Update a KPI (status, assignments, etc.)
 * @access  Private
 */
// If you haven't, define this somewhere above:



  

/**
 * PATCH /api/v1/kpis/:id
 * Updates a KPI. 
 * - If creator changes status, the official KPI status is updated
 * - If assigned user changes status, it only updates userStatuses[userId]
 *   so others see no change
 */
 

// controllers/kpiController.ts – deliverables‑only patch
// Status changes have been moved to changeKpiStatus (PATCH /:id/status)

export const updateKpi = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const callerId = req.authUser!._id.toString();

    const { deliverables, assigneeId } = req.body as {
      deliverables?: Partial<IDeliverable>[];
      assigneeId?: string | { _id: string };
    };

    const kpi = await Kpi.findById(id);
    if (!kpi) return void res.status(404).json({ message: "KPI not found" });

    normaliseUserSpecific(kpi);
    const isCreator = String(kpi.createdBy) === callerId;

    const safeAssigneeId =
      assigneeId && typeof assigneeId === "object"
        ? String(assigneeId._id)
        : assigneeId;

    if (deliverables) {
      updateKpiDeliverables(
        kpi,
        deliverables,
        callerId,
        isCreator,
        safeAssigneeId
      );

      if (isCreator && safeAssigneeId) {
        const view =
          kpi.userSpecific!.deliverables.get(String(safeAssigneeId)) ?? [];

        for (let i = 0; i < view.length; i++) {
          const d = view[i];
          if (
            d?.assigneeScore?.value !== undefined &&
            d?.creatorScore?.value !== undefined
          ) {
            await maybeFlagDiscrepancy(
              kpi._id as mongoose.Types.ObjectId,
              i,
              d,
              callerId,
              safeAssigneeId
            );
          }
        }
      }
    }

    kpi.lastUpdatedBy = {
      user: new mongoose.Types.ObjectId(callerId),
      userType: isCreator ? "creator" : "assignee",
      timestamp: new Date(),
    };

    await kpi.save();

    const callerStatus =
      kpi.userSpecific!.statuses.get(callerId) ?? kpi.status;
    const callerDeliverables = await buildDeliverablesForCaller(kpi, callerId);

    res.status(200).json({
      message: "KPI updated successfully (status unchanged)",
      kpi: {
        ...kpi.toObject(),
        status: callerStatus,
        deliverables: callerDeliverables,
        userSpecific: {
          statuses: Object.fromEntries(kpi.userSpecific!.statuses),
          deliverables: Object.fromEntries(
            Array.from(kpi.userSpecific!.deliverables.entries()).map(
              ([key, value]) => [String(key), value]
            )
          ),
        },
      },
    });
  } catch (err) {
    console.error("updateKpi error:", err);
    res.status(500).json({
      message: "Server error",
      error: (err as Error).message,
    });
  }
};




/**
 * @route   DELETE /api/v1/kpis/:id
 * @desc    Delete a KPI
 * @access  Private
 */
export const deleteKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedKpi = await Kpi.findByIdAndDelete(id);
    if (!deletedKpi) {
      res.status(404).json({ message: "KPI not found" });
      return;
    }

    res.status(200).json({ message: "KPI deleted successfully" });
  } catch (error) {
    console.error("Error deleting KPI:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @route   POST /api/v1/kpis/:id/upload
 * @desc    Upload evidence for a KPI (Docs, PDFs)
 * @access  Private
 */
export const uploadEvidence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }

    const kpi = await Kpi.findById(id);
    if (!kpi) {
      res.status(404).json({ message: "KPI not found" });
      return;
    }

    kpi.evidence?.push(`/uploads/evidence/${file.filename}`);
    await kpi.save();

    res.status(200).json({ message: "Evidence uploaded successfully", kpi });
  } catch (error) {
    console.error("Error uploading evidence:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Add this to your kpiController.ts

/**
 * @route   GET /api/v1/kpis/user/:userId
 * @desc    Get KPIs assigned to a specific user
 * @access  Private (Authenticated users only)
 */
/**
 * GET /api/v1/kpis/user/:userId
 * KPIs assigned to a specific user – returns THAT USER’S OWN scores
 */
export const getUserKpis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { _id: callerId, role: callerRole } = req.authUser!;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return void res.status(400).json({ message: "Invalid user ID" });

    /* auth check (unchanged) */
    if (callerRole !== "Rector" && userId !== String(callerId)) {
      const allowed = await Kpi.exists({ assignedUsers: userId, createdBy: callerId });
      if (!allowed) return void res.status(403).json({ message: "Not authorized" });
    }

    const raw = await Kpi.find({ assignedUsers: userId })
      .populate("departments", "name")
      .populate("assignedUsers", "username fullName email role")
      .populate("createdBy", "username fullName email role")
      .populate("header", "name description")
      .lean();

    const kpis = await Promise.all(
      raw.map(async (k: any) => {
        normaliseUserSpecific(k);
        return {
          ...k,
          deliverables: await buildDeliverablesForCaller(k, userId)   // ← personal copy
        };
      })
    );

    res.status(200).json(kpis);
  } catch (err) {
    console.error("Error fetching user KPIs:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};



export const changeKpiStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, promoteGlobally = true, assigneeId } = req.body;

    if (!status) {
      res.status(400).json({ message: "Missing status" });
      return;
    }

    const kpi = await Kpi.findById(id);
    const callerId = req.authUser!._id.toString();

    if (!kpi) {
      res.status(404).json({ message: "KPI not found" });
      return;
    }

    const isCreator = String(kpi.createdBy) === callerId;

    updateKpiStatus(
      kpi,
      status,
      assigneeId ?? callerId,
      isCreator,
      promoteGlobally
    );

    kpi.lastUpdatedBy = {
      user: new mongoose.Types.ObjectId(callerId),
      userType: isCreator ? "creator" : "assignee",
      timestamp: new Date()
    };

    await kpi.save();

    res.status(200).json({ message: "Status updated", status });
  } catch (err) {
    console.error("changeKpiStatus error:", err);
    res.status(500).json({ message: "Server error", error: (err as Error).message });
  }
};

