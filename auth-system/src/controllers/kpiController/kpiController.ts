import {  Response } from "express";
import Kpi, { IKpi } from "../../models/Kpi";

import User from "../../models/User";
import { AuthRequest } from "../../types/types";
import KpiHeader from "../../models/KpiHeaders";
import { recomputeWeights, academicYearKey } from "../../utils/kpiWeight";

import mongoose from "mongoose";
import { calculateKpiPermissions } from "../../utils/kpiPermissions";

import DeliverableDiscrepancy from "../../models/DeliverableDiscrepancy";
import {
  buildDeliverablesForCaller,
  normaliseUserSpecific,
} from "../../utils/kpiResponse";
import { canAssignTo, isSuperAdmin, SystemRole } from "../../utils/rolesAccess";
import Department from "../../models/Department";
import { buildCallerResponse } from "./updateKpi/buildResponse";

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
    role: string;
  };
  header?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
  };
};

// kpiController.ts
const DELIVERABLE_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Approved",
];

export const getDeliverableStatuses = (req: AuthRequest, res: Response) => {
  // Optionally check user role, etc.
  res.json({ statuses: DELIVERABLE_STATUSES });
};

/**
 * @route   GET /api/v1/kpis
 * @desc    Fetch all KPIs (filtered by user role)
 * @access  Private (Authenticated users only)
 */

export const getAllKpis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, _id: userId } = req.authUser!;
    const userIdStr = String(userId);
    const { department: userDepartment } = req.authUser!;
    const { year } = req.query as { year?: string };

    /* ---------- build query ---------- */
    let depId: mongoose.Types.ObjectId | null = null;
    if (userDepartment) {
      const id = typeof userDepartment === "object" ? (userDepartment as any)._id : userDepartment;
      if (mongoose.Types.ObjectId.isValid(id)) depId = new mongoose.Types.ObjectId(id as any);
    }

    let query: any = {};
    if (!isSuperAdmin(role)) {
      query = {
        $or: [
          { assignedUsers: userId },
          ...(depId ? [{ departments: depId }] : []),
          ...(role ? [{ assignedRoles: role }] : []),
        ],
      };
    }
    if (year) query.academicYear = year;

    /* ---------- fetch KPIs with full population ---------- */
    const raw = await Kpi.find(query)
      .populate({ path: "departments", select: "name" })
      .populate({ path: "assignedUsers", select: "username fullName email role employeeId" })
      .populate({ path: "createdBy", select: "fullName email role" })
      .populate({ path: "header", select: "name description" })
      .lean()
      .exec();

    const kpis = raw as unknown as LeanKpi[];

    const enriched = await Promise.all(
      kpis.map(async (kpi) => {
        // normalize userSpecific Maps if needed
        normaliseUserSpecific(kpi as any);

        const { isCreator, isAssignedUser } = calculateKpiPermissions(
          kpi,
          userIdStr,
          role,
          depId
        );

        // 1) Build the caller's deliverables (your existing projector)
        const callerDeliverables = await buildDeliverablesForCaller(kpi as any, userIdStr);

        // 2) Read discrepancy docs for this KPI
        const allFlags = await DeliverableDiscrepancy.find({ kpiId: kpi._id }).lean().exec();

        // Filter: if caller is NOT the creator, only show their own flags
        const flags = isCreator ? allFlags : allFlags.filter(f => String(f.assigneeId) === userIdStr);

        // 3) Aggregate by deliverable index + by occurrence
        type OccAgg = { openCount: number; hasOpen: boolean };
        type DelivAgg = { openCount: number; hasOpen: boolean; occ: Map<string, OccAgg> };

        const idxAgg = new Map<number, DelivAgg>();

        for (const f of flags) {
          const key = f.deliverableIndex ?? 0;
          const occLabel = f.occurrenceLabel ?? null;
          const isOpen = f.resolved === false;

          if (!idxAgg.has(key)) idxAgg.set(key, { openCount: 0, hasOpen: false, occ: new Map() });
          const agg = idxAgg.get(key)!;

          if (isOpen) {
            agg.openCount += 1;
            agg.hasOpen = true;
          }

          if (occLabel) {
            const occ = agg.occ.get(occLabel) ?? { openCount: 0, hasOpen: false };
            if (isOpen) {
              occ.openCount += 1;
              occ.hasOpen = true;
            }
            agg.occ.set(occLabel, occ);
          }
        }

        // 4) Attach discrepancy summaries to deliverables and occurrences
        const deliverablesWithFlags = callerDeliverables.map((d, idx) => {
          const agg = idxAgg.get(idx);
          const baseDisc =
            agg
              ? { hasOpen: agg.hasOpen, openCount: agg.openCount }
              : { hasOpen: false, openCount: 0 };

          // decorate occurrences (if any)
          const withOcc =
            Array.isArray(d.occurrences)
              ? d.occurrences.map((o: any) => {
                  const occAgg = agg?.occ.get(String(o?.periodLabel));
                  return {
                    ...o,
                    discrepancy: occAgg
                      ? { hasOpen: occAgg.hasOpen, openCount: occAgg.openCount }
                      : { hasOpen: false, openCount: 0 },
                  };
                })
              : d.occurrences;

          return {
            ...d,
            occurrences: withOcc,
            discrepancy: baseDisc,
          };
        });

        return {
          ...kpi,
          deliverables: deliverablesWithFlags,
          academicYear: kpi.academicYear,
          isCreator,
          isAssignedUser,
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

export const createKpi = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, header } = req.body;

    const departments: string[] = req.body.departments
      ? JSON.parse(req.body.departments)
      : [];
    const assignedUsers: string[] = req.body.assignedUsers
      ? JSON.parse(req.body.assignedUsers)
      : [];
    const assignedRoles: SystemRole[] = req.body.assignedRoles
      ? JSON.parse(req.body.assignedRoles)
      : [];
    const deliverables: any[] = req.body.deliverables
      ? JSON.parse(req.body.deliverables)
      : [];

    const createdBy = req.authUser?._id;
    const callerRole = req.authUser?.role as SystemRole;
    const isSuper = isSuperAdmin(callerRole);

    if (!createdBy || !callerRole)
      return void res
        .status(400)
        .json({ message: "Creator information is missing." });

    if (!name || !header)
      return void res
        .status(400)
        .json({ message: "Name and header are required." });

    if (
      departments.length === 0 &&
      assignedUsers.length === 0 &&
      assignedRoles.length === 0
    )
      return void res
        .status(400)
        .json({
          message: "Must assign to at least one department, user, or role.",
        });

    if (!isSuper) {
      const creator = await User.findById(createdBy)
        .select("department")
        .lean();

      const myDeptIds = Array.isArray(creator?.department)
        ? creator!.department.map((d: mongoose.Types.ObjectId) => String(d))
        : creator?.department
        ? [String(creator.department)]
        : [];

      const forbiddenDept = departments.filter((id) => !myDeptIds.includes(id));
      if (forbiddenDept.length)
        return void res.status(403).json({
          message: "You can assign KPIs only within your department(s)",
          departments: forbiddenDept,
        });
    }

    const existingDeptCount = await Department.countDocuments({
      _id: { $in: departments.map((id) => new mongoose.Types.ObjectId(id)) },
    });
    if (existingDeptCount !== departments.length)
      return void res
        .status(400)
        .json({ message: "One or more departments don't exist" });

    if (!(await KpiHeader.exists({ _id: header })))
      return void res
        .status(400)
        .json({ message: "Specified header doesn't exist" });

    if (!isSuper) {
      const forbiddenRoles = assignedRoles.filter(
        (r: SystemRole) => !canAssignTo(callerRole, r)
      );
      if (forbiddenRoles.length)
        return void res.status(403).json({
          message: "You cannot assign KPIs to these roles",
          roles: forbiddenRoles,
        });
    }

    if (!isSuper) {
      const userDocs = await User.find(
        { _id: { $in: assignedUsers } },
        { role: 1 }
      ).lean();
      const forbiddenUsers = userDocs.filter(
        (u) => !canAssignTo(callerRole, u.role as SystemRole)
      );
      if (forbiddenUsers.length)
        return void res.status(403).json({
          message: "You cannot assign KPIs to some selected users",
          userIds: forbiddenUsers.map((u) => u._id),
        });
    }

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const idx = parseInt(file.fieldname.split("_")[1] ?? "", 10);
        if (!isNaN(idx) && deliverables[idx])
          deliverables[idx].evidence = [
            ...(deliverables[idx].evidence || []),
            `/uploads/evidence/${file.filename}`,
          ];
      });
    }

    const sanitizedDeliverables = deliverables.map((d: any) => ({
      ...d,
      promoteGlobally: d.promoteGlobally ?? false,
      isRecurring: d.isRecurring ?? false,
      recurrencePattern: d.recurrencePattern ?? "",
    }));

    const academicYear = academicYearKey();

    const newKpi = new Kpi({
      name,
      description,
      header: new mongoose.Types.ObjectId(header),
      departments: departments.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      ),
      assignedUsers: assignedUsers.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      ),
      assignedRoles,
      deliverables: sanitizedDeliverables,
      createdBy,
      createdByModel: "User",
      academicYear,
    });

    const savedKpi = await newKpi.save();

    await recomputeWeights(academicYear);

    await KpiHeader.findByIdAndUpdate(header, {
      $push: { kpis: savedKpi._id },
    });

    const populatedKpi = await Kpi.findById(savedKpi._id)
      .populate("departments", "name description")
      .populate("assignedUsers", "username fullName email role employeeId")
      .populate("header", "name description")
      .populate("createdBy", "username fullName email role")
      .lean();

    res
      .status(201)
      .json({ message: "KPI created successfully", kpi: populatedKpi });
  } catch (err) {
    console.error("Error creating KPI:", err);
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
export const deleteKpi = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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

    // NOTE: Multer is wired with upload.single("file") in your router
    // router.post("/:id/upload", verifyToken, upload.single("file"), uploadEvidence);

    // Parse fields (multer populates req.body for text fields in multipart)
    const { deliverableId, occurrenceLabel, assigneeId } = (req.body ?? {}) as {
      deliverableId?: string;
      occurrenceLabel?: string; // e.g. "2025-W33" or "2025-08-01"
      assigneeId?: string;
    };

    if (!file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }
    if (!deliverableId || !mongoose.isValidObjectId(deliverableId)) {
      res.status(400).json({ message: "deliverableId is required" });
      return;
    }

    const kpi = await Kpi.findById(id);
    if (!kpi) {
      res.status(404).json({ message: "KPI not found" });
      return;
    }

    const uploadedUrl = `/uploads/evidence/${file.filename}`;

    // ---------- normalise userSpecific as real Maps ----------
    const ensureMap = <V = any>(m: any): Map<string, V> => {
      if (!m) return new Map<string, V>();
      if (m instanceof Map) return m as Map<string, V>;
      return new Map<string, V>(Object.entries(m));
    };

    const us: any = kpi.userSpecific || {};
    us.deliverables = ensureMap<any[]>(us.deliverables);
    us.statuses = ensureMap<any>(us.statuses);
    kpi.userSpecific = us;

    // ---------- choose the "owner" whose view we update ----------
    const callerId = String(req.authUser!._id);
    const isCreator = String(kpi.createdBy) === callerId;
    const ownerId = String(assigneeId || callerId);

    // Seed a per-user deliverables array from the global KPI deliverables
    const seedFromGlobal = () =>
      (kpi.deliverables || []).map((d: any) => ({
        deliverableId: d._id,
        evidence: [],
        occurrences: [],
        status: "Pending",
      }));

    const ensureUserArr = (uid: string) => {
      let arr = us.deliverables.get(uid);
      if (!Array.isArray(arr)) {
        arr = seedFromGlobal();
        us.deliverables.set(uid, arr);
      }
      return arr as any[];
    };

    const assigneeView = ensureUserArr(ownerId);
    const creatorView = isCreator ? ensureUserArr(String(kpi.createdBy)) : null;

    // Safe find (and create if not present, e.g., deliverable added later)
    const findState = (arr: any[]) => arr.find(s => String(s.deliverableId) === String(deliverableId));
    let aState = findState(assigneeView);
    if (!aState) {
      aState = { deliverableId, evidence: [], occurrences: [], status: "Pending" };
      assigneeView.push(aState);
    }
    let cState = isCreator ? findState(creatorView!) : null;
    if (isCreator && !cState) {
      cState = { deliverableId, evidence: [], occurrences: [], status: "Pending" };
      creatorView!.push(cState);
    }

    // ---------- push evidence (deliverable-level or occurrence-level) ----------
    const pushEvidence = (state: any) => {
      if (occurrenceLabel && occurrenceLabel.trim()) {
        state.occurrences = Array.isArray(state.occurrences) ? state.occurrences : [];
        let occ = state.occurrences.find((o: any) => o?.periodLabel === occurrenceLabel);
        if (!occ) {
          occ = { periodLabel: occurrenceLabel, status: "Pending", evidence: [] };
          state.occurrences.push(occ);
        }
        occ.evidence = Array.from(new Set([...(occ.evidence || []), uploadedUrl]));
      } else {
        state.evidence = Array.from(new Set([...(state.evidence || []), uploadedUrl]));
      }
    };

    pushEvidence(aState);
    if (isCreator && cState) pushEvidence(cState);

    // ---------- persist ----------
    kpi.markModified("userSpecific.deliverables");
    await kpi.save();

    // Return caller-shaped KPI so UI updates instantly
    const payload = await buildCallerResponse(kpi, callerId);
    res.status(200).json({
      message: "Evidence uploaded successfully",
      uploadedUrl,
      kpi: payload,
    });
  } catch (error: any) {
    console.error("Error uploading evidence:", error);
    res.status(500).json({ message: "Server error", error: error?.message || String(error) });
  }
};

// --- helpers (keep in this file) --------------------------------------------

 export const toStringKeyEntries = <V = any>(m: any): [string, V][] => {
  if (!m) return [];
  if (m instanceof Map) {
    return Array.from(m.entries()).map(
      ([k, v]) => [String(k), v] as [string, V]
    );
  }
  // if it’s already a plain object
  return Object.entries(m) as [string, V][];
};

 export const toPlainObject = <V = any>(m: any): Record<string, V> => {
  return Object.fromEntries(toStringKeyEntries<V>(m));
};




