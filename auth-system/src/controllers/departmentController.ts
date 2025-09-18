// controllers/departmentController.ts
import { Response } from "express";
import Department from "../models/Department";
import { AuthRequest } from "../types/types";
import { Types } from "mongoose";
import { getAccessibleDepartmentIdsFor, getAccessibleDepartmentIdsForStrings, rebuildAncestors } from "../utils/departments";
import { isTopRole } from "../utils/rolesAccess";
// ^ Your extended Request interface with `authUser?: { id: string; role: string }`

/**
 * Create a new department (Rector only)   
 */
export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) {
      return void res.status(401).json({ message: "Unauthorized" });
    }

    const callerId = new Types.ObjectId(String(req.authUser._id));
    const top = isTopRole(req.authUser.role);

    const {
      name,
      description = "",
      category = "Faculty",
      parent,                 // optional parent id
      headUserId,             // optional explicit head
      makeCreatorHead = true, // default: creator becomes head if none provided
    } = req.body;

    if (!name) return void res.status(400).json({ message: "Department name is required" });
    if (!["Faculty", "Unit"].includes(category)) {
      return void res.status(400).json({ message: "Invalid category (must be Faculty or Unit)" });
    }

    // Case-insensitive, per-category dedupe (mirrors your compound index + collation)
    const exists = await Department.findOne({ name, category })
      .collation({ locale: "en", strength: 2 })
      .lean();
    if (exists) return void res.status(409).json({ message: "Department already exists in this category" });

    // Parent checks
    if (parent) {
      const parentDoc = await Department.findById(parent)
        .select("_id supervisors")
        .lean();
      if (!parentDoc) {
        return void res.status(400).json({ message: "Parent department not found" });
      }
      // Non-top must supervise the parent
      if (!top) {
        const isSupervisor = (parentDoc.supervisors || []).map(String).includes(String(callerId));
        if (!isSupervisor) {
          return void res.status(403).json({ message: "Forbidden: not a supervisor of the parent department" });
        }
      }
    } else {
      // Root department: only Top-4
      if (!top) {
        return void res.status(403).json({ message: "Only top roles can create root departments" });
      }
    }

    // Decide head
    const headId = headUserId
      ? new Types.ObjectId(String(headUserId))
      : (makeCreatorHead ? callerId : null);

    // Let the pre-save hook compute ancestors; just set parent
    const doc = await Department.create({
      name,
      description,
      category,
      createdBy: callerId,
      parent: parent ? new Types.ObjectId(String(parent)) : null,
      supervisors: headId ? [headId] : [],
      head: headId ?? null,
    });

    res.status(201).json({ message: "Department created successfully", department: doc });
  } catch (err: any) {
    // Handle unique conflicts cleanly
    if (err?.code === 11000) {
      return void res.status(409).json({ message: "Department already exists in this category" });
    }
    console.error("Error creating department:", err);
    res.status(500).json({ message: "Server error", err });
  }
};





/**
 * Get all departments (any logged-in user can view, or even public if you prefer)
 */
export const getAllDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await Department.find().populate("createdBy", "fullName email");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get one department by ID
 */
export const getDepartmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid department id" });
      return;
    }
    const department = await Department.findById(id).populate("createdBy", "fullName email");
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }
    res.status(200).json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getDepartmentsScoped = async (req: AuthRequest, res: Response) => {
  if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });

  // Top-4 can still ask for all; everyone else gets scope-limited
  const scope = String(req.query.scope || "mine"); // "mine" | "all"
  const isTop = isTopRole(req.authUser.role);

  if (isTop && scope === "all") {
    const all = await Department.find().lean();
    return void res.status(200).json(all);
  }

  const ids = await getAccessibleDepartmentIdsFor(req.authUser);
  const rows = await Department.find({ _id: { $in: ids } }).lean();
  res.status(200).json(rows);
};
/**
 * Update department (Rector only)
 */
export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const {
      name,
      description,
      category,
      parent, // string | null | undefined
      addSupervisors = [],
      removeSupervisors = [],
      headUserId,        // set new head (null allowed)
      clearHead = false, // explicitly clear head
    } = req.body;

    const dep = await Department.findById(id);
    if (!dep) return void res.status(404).json({ message: "Department not found" });

    const callerId = new Types.ObjectId(String(req.authUser._id));
    const top = isTopRole(req.authUser.role);
    const isSupervisor = dep.supervisors.map(String).includes(String(callerId));
    if (!top && !isSupervisor) {
      return void res.status(403).json({ message: "Only top roles or department supervisors can update this department." });
    }

    // Parent / root guards
    const parentChanged = parent !== undefined && String(dep.parent || "") !== String(parent || "");
    if (parent !== undefined) {
      if (parent) {
        const newParent = await Department.findById(parent).select("_id supervisors").lean();
        if (!newParent) return void res.status(400).json({ message: "New parent department not found" });
        if (!top) {
          const supNew = (newParent.supervisors || []).map(String).includes(String(callerId));
          if (!supNew) return void res.status(403).json({ message: "Forbidden: not a supervisor of the target parent" });
        }
        dep.parent = new Types.ObjectId(String(parent));
      } else {
        if (!top) return void res.status(403).json({ message: "Only top roles can move a department to root" });
        dep.parent = null;
      }
    }

    // Name/category updates with uniqueness check
    if (name || category) {
      const newName = name ?? dep.name;
      const newCat = category && ["Faculty", "Unit"].includes(category) ? category : dep.category;
      const clash = await Department.findOne({
        _id: { $ne: dep._id },
        name: newName,
        category: newCat,
      }).collation({ locale: "en", strength: 2 }).lean();
      if (clash) return void res.status(409).json({ message: "Another department with this name already exists in that category" });
      dep.name = newName;
      dep.category = newCat as any;
    }

    if (description !== undefined) dep.description = description;

    await dep.save(); // triggers pre-save checks; does NOT yet touch supervisors/head

    // Apply supervisors changes via statics to keep user mirror in sync
    const toAdd = (addSupervisors as string[]).map((s) => new Types.ObjectId(String(s)));
    const toRemove = (removeSupervisors as string[]).map((s) => new Types.ObjectId(String(s)));

    for (const uid of toAdd) await Department.addSupervisor(dep._id as Types.ObjectId, uid);
    for (const uid of toRemove) await Department.removeSupervisor(dep._id as Types.ObjectId, uid);

    // Head changes via statics
    if (headUserId !== undefined) {
      await Department.setHead(dep._id as Types.ObjectId, headUserId ? new Types.ObjectId(String(headUserId)) : null);
    } else if (clearHead) {
      await Department.setHead(dep._id as Types.ObjectId, null);
    }

    // If parent changed, rebuild descendant ancestors
    if (parentChanged) await rebuildAncestors(dep._id as Types.ObjectId);

    // Return fresh doc
    const fresh = await Department.findById(dep._id);
    res.status(200).json({ message: "Department updated", department: fresh });
  } catch (err: any) {
    if (err?.code === 11000) {
      return void res.status(409).json({ message: "Another department with this name already exists in that category" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};

export const getMyDepartments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });

    const ids = await getAccessibleDepartmentIdsFor(req.authUser); // ✅ accepts MinimalAuth
    const departments = await Department.find({ _id: { $in: ids } })
      .populate("createdBy", "fullName email")
      .lean();

    res.status(200).json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Delete department (Rector only)
 */
export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Ensure only the Rector can delete departments
      if (!req.authUser || req.authUser.role !== "Rector") {
        res.status(403).json({ message: "Forbidden: Only the Rector can delete departments." });
        return;
      }
  
      const { id } = req.params;
  
      // Try to delete the department
      const deletedDepartment = await Department.findByIdAndDelete(id);
  
      if (!deletedDepartment) {
        res.status(404).json({ message: "Department not found" });
        return;
      }
  
      res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  



export const getDepartmentsForCreateUser = async (req: AuthRequest, res: Response) => {
  if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });

  const isTop = isTopRole(req.authUser.role);
  const scope = String(req.query.scope || "mine");
  const parentParam = req.query.parent ? String(req.query.parent) : null;

  let rows: any[] = [];

  if (!parentParam) {
    // Top-level: ONLY roots
    rows = await Department.find({ parent: null })
      .select("_id name parent")
      .sort({ name: 1 })
      .lean();
  } else {
    const parentId = new Types.ObjectId(parentParam);

    // Department-level: parent + ALL descendants (any depth)
    rows = await Department.find({
      $or: [{ _id: parentId }, { ancestors: parentId }],
    })
      .select("_id name parent ancestors")
      .lean();

    // Parent first, then the rest by name
    const parentRow = rows.find((r) => String(r._id) === parentParam);
    const rest = rows
      .filter((r) => String(r._id) !== parentParam)
      .sort((a, b) => a.name.localeCompare(b.name));
    rows = parentRow ? [parentRow, ...rest] : rest;
  }

  // Selectable flag based on caller's scope (Top+all → always true)
  let selectableSet: Set<string> | null = null;
  if (!(isTop && scope === "all")) {
    const ids = await getAccessibleDepartmentIdsForStrings(req.authUser);
    selectableSet = new Set(ids.map(String));
  }

  const out = rows.map((r) => ({
    _id: r._id,
    name: r.name,
    parent: r.parent ?? null,
    selectable: selectableSet ? selectableSet.has(String(r._id)) : true,
  }));

  res.status(200).json(out);
};
