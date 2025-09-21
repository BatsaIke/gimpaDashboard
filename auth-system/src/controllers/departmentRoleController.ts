import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types/types";
import DeptRole, { toSlug } from "../models/DeptRole";
import DeptRoleAssignment from "../models/DeptRoleAssignment";
import Department from "../models/Department";
import { isTopRole } from "../utils/rolesAccess";

function canManageDept(deptId: Types.ObjectId, caller: any, callerIsTop: boolean): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (callerIsTop) return resolve(true);
    // caller must supervise this department
    const dep = await Department.findById(deptId).select("_id supervisors").lean();
    if (!dep) return resolve(false);
    const ok = (dep.supervisors || []).map(String).includes(String(caller._id));
    resolve(ok);
  });
}

/* ---------- Create Dept Role ---------- */
export const createDeptRole = async (req: AuthRequest, res: Response) => {
    
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });
    const { departmentId } = req.params;
    const { name, description = "", reportsTo = null } = req.body;

    if (!name) return void res.status(400).json({ message: "Role name is required" });
    if (!Types.ObjectId.isValid(departmentId)) return void res.status(400).json({ message: "Invalid department id" });

    const deptId = new Types.ObjectId(departmentId);
    const callerIsTop = isTopRole(req.authUser.role);
    if (!(await canManageDept(deptId, req.authUser, callerIsTop))) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    const slug = toSlug(name);
    if (reportsTo && !Types.ObjectId.isValid(reportsTo)) {
      return void res.status(400).json({ message: "Invalid reportsTo id" });
    }

    // ensure reportsTo belongs to same department (if provided)
    if (reportsTo) {
      const parent = await DeptRole.findOne({ _id: reportsTo, department: deptId }).lean();
      if (!parent) return void res.status(400).json({ message: "reportsTo must be a role in the same department" });
    }

    const exists = await DeptRole.findOne({ department: deptId, slug }).collation({ locale: "en", strength: 2 });
    if (exists) return void res.status(409).json({ message: "Role already exists in this department" });

    const role = await DeptRole.create({
      department: deptId,
      name,
      slug,
      description,
      reportsTo: reportsTo ? new Types.ObjectId(String(reportsTo)) : null,
      createdBy: req.authUser._id,
      isActive: true,
    });

    res.status(201).json({ message: "Department role created", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- List Dept Roles ---------- */
export const listDeptRoles = async (req: AuthRequest, res: Response) => {    
  try {
    const { departmentId } = req.params;
    if (!Types.ObjectId.isValid(departmentId)) return void res.status(400).json({ message: "Invalid department id" });

    const roles = await DeptRole.find({ department: departmentId, isActive: true }).sort({ name: 1 }).lean();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- Update Dept Role ---------- */
export const updateDeptRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });
    const { departmentId, roleId } = req.params;
    const { name, description, reportsTo } = req.body;

    if (!Types.ObjectId.isValid(departmentId) || !Types.ObjectId.isValid(roleId)) {
      return void res.status(400).json({ message: "Invalid ids" });
    }
    const deptId = new Types.ObjectId(departmentId);
    const callerIsTop = isTopRole(req.authUser.role);
    if (!(await canManageDept(deptId, req.authUser, callerIsTop))) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    const role = await DeptRole.findOne({ _id: roleId, department: deptId });
    if (!role) return void res.status(404).json({ message: "Role not found" });

    if (name && name !== role.name) {
      const slug = toSlug(name);
      const clash = await DeptRole.findOne({ department: deptId, slug, _id: { $ne: role._id } })
        .collation({ locale: "en", strength: 2 });
      if (clash) return void res.status(409).json({ message: "Role name already exists in this department" });
      role.name = name;
      role.slug = slug;
    }

    if (typeof description === "string") role.description = description;

    if (reportsTo !== undefined) {
      if (reportsTo === null) {
        role.reportsTo = null;
      } else {
        if (!Types.ObjectId.isValid(reportsTo)) {
          return void res.status(400).json({ message: "Invalid reportsTo id" });
        }
        // ensure same-dept parent
        const parent = await DeptRole.findOne({ _id: reportsTo, department: deptId }).lean();
        if (!parent) return void res.status(400).json({ message: "reportsTo must be a role in the same department" });
        if (String(parent._id) === String(role._id)) {
          return void res.status(400).json({ message: "Role cannot report to itself" });
        }
        role.reportsTo = new Types.ObjectId(String(reportsTo));
      }
    }

    await role.save();
    res.status(200).json({ message: "Department role updated", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- Delete Dept Role ---------- */
// Soft-delete by default; prevent deletion if assignments exist (or cascade end them)
export const deleteDeptRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });
    const { departmentId, roleId } = req.params;
    if (!Types.ObjectId.isValid(departmentId) || !Types.ObjectId.isValid(roleId)) {
      return void res.status(400).json({ message: "Invalid ids" });
    }
    const deptId = new Types.ObjectId(departmentId);
    const callerIsTop = isTopRole(req.authUser.role);
    if (!(await canManageDept(deptId, req.authUser, callerIsTop))) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    const hasAssignments = await DeptRoleAssignment.exists({ role: roleId, isActive: true });
    if (hasAssignments) {
      // Option A: block deletion
      return void res.status(400).json({ message: "Role is assigned to users. Unassign or end assignments first." });
      // Option B (alternative): soft-disable role
      // await DeptRole.updateOne({ _id: roleId, department: deptId }, { $set: { isActive: false } });
      // return void res.status(200).json({ message: "Role disabled" });
    }

    await DeptRole.deleteOne({ _id: roleId, department: deptId });
    res.status(200).json({ message: "Department role deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- Assign / Unassign ---------- */
export const assignDeptRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });
    const { departmentId } = req.params;
    const { userId, roleId, startAt = null } = req.body;

    if (![departmentId, userId, roleId].every(Types.ObjectId.isValid)) {
      return void res.status(400).json({ message: "Invalid ids" });
    }
    const deptId = new Types.ObjectId(departmentId);
    const callerIsTop = isTopRole(req.authUser.role);
    if (!(await canManageDept(deptId, req.authUser, callerIsTop))) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    // Ensure role belongs to this department
    const role = await DeptRole.findOne({ _id: roleId, department: deptId, isActive: true }).lean();
    if (!role) return void res.status(404).json({ message: "Role not found in this department" });

    const doc = await DeptRoleAssignment.findOneAndUpdate(
      { user: userId, department: deptId, role: roleId },
      { $setOnInsert: { startAt, createdBy: req.authUser._id }, $set: { isActive: true } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Role assigned", assignment: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unassignDeptRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });
    const { departmentId } = req.params;
    const { userId, roleId, endAt = new Date() } = req.body;

    if (![departmentId, userId, roleId].every(Types.ObjectId.isValid)) {
      return void res.status(400).json({ message: "Invalid ids" });
    }
    const deptId = new Types.ObjectId(departmentId);
    const callerIsTop = isTopRole(req.authUser.role);
    if (!(await canManageDept(deptId, req.authUser, callerIsTop))) {
      return void res.status(403).json({ message: "Forbidden" });
    }

    const upd = await DeptRoleAssignment.findOneAndUpdate(
      { user: userId, department: deptId, role: roleId, isActive: true },
      { $set: { isActive: false, endAt } },
      { new: true }
    );
    if (!upd) return void res.status(404).json({ message: "Active assignment not found" });

    res.status(200).json({ message: "Role unassigned", assignment: upd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
