import { Request, Response } from "express";

import {
  SystemRole,
  isSuperAdmin,
  getAllDescendantRoles,
  isTopRole,
  ALL_ROLES_ARRAY,
} from "../../../utils/rolesAccess";
import Department from "../../../models/Department";
import {
  getAccessibleDepartmentIdsForStrings,
} from "../../../utils/departments";
import { Types } from "mongoose";
import User from "../../../models/User";
import { AuthRequest } from "../../../middleware/authMiddleware";
import DeptRole from "../../../models/DeptRole";



const TOP4_ROLES: SystemRole[] = [
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
];



// Returns all department ids (strings) the user supervises: direct + descendants.
async function getSupervisedTreeDeptIdStrings(userId: Types.ObjectId) {
  // Directly supervised “roots”
  const roots = await Department.find({ supervisors: userId })
    .select("_id")
    .lean();

  const rootIds = roots.map((d) => d._id as Types.ObjectId);
  if (rootIds.length === 0) return [];

  // Include roots + every descendant (requires Department.ancestors[] to be present)
  const tree = await Department.find({
    $or: [{ _id: { $in: rootIds } }, { ancestors: { $in: rootIds } }],
  })
    .select("_id")
    .lean();

  return tree.map((d) => String(d._id));
}

async function syncUserSupervisorMirror(userId: Types.ObjectId) {
  const deps = await Department.find({ supervisors: userId }).select("_id").lean();
  const depIds = deps.map(d => d._id as Types.ObjectId);

  const u = await User.findById(userId);
  if (!u) return;

  const hasAny = depIds.length > 0;
  const next = new Set<string>(depIds.map(String));
  const prev = new Set<string>((u.supervisedDepartments || []).map(String));

  const changed =
    u.isSupervisor !== hasAny ||
    depIds.length !== u.supervisedDepartments.length ||
    depIds.some(id => !prev.has(String(id)));

  if (changed) {
    u.isSupervisor = hasAny;
    u.supervisedDepartments = depIds as any;
    await u.save();
  }
}


export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const caller = req.authUser!;
  const callerRole = caller.role as SystemRole;

  const target = await User.findById(id);
  if (!target) return void res.status(404).json({ message: "User not found" });

  const isTop = isTopRole(callerRole);
  const callerIsSuper = isSuperAdmin(callerRole as SystemRole);

  // ---- Supervision subtrees (caller & target) ----
  const callerSupervisedTreeArr = await getSupervisedTreeDeptIdStrings(caller._id as Types.ObjectId);
  const callerSupervisedTree = new Set(callerSupervisedTreeArr.map(String));
  const callerIsSupervisor = callerSupervisedTree.size > 0 || !!(caller as any).isSupervisor;

  const targetSupervisedTreeArr = await getSupervisedTreeDeptIdStrings(target._id as Types.ObjectId);
  const targetSupervisedTree = new Set(targetSupervisedTreeArr.map(String));
  const targetIsSupervisor = targetSupervisedTree.size > 0 || !!(target as any).isSupervisor;

  // Home departments (string ids)
  const callerDeptId = caller.department ? String((caller as any).department?._id || caller.department) : "";
  const targetDeptId = target.department ? String((target as any).department?._id || target.department) : "";

  // ─────────────────────────────────────────────────────────────
  // 0) BLOCK: juniors cannot edit seniors who can act on them
  // ─────────────────────────────────────────────────────────────
  if (!isTop && callerIsSupervisor && targetIsSupervisor) {
    const targetSupervisesCallerHome = callerDeptId && targetSupervisedTree.has(callerDeptId);
    const overlapInSupervisedArea = [...callerSupervisedTree].some((d) => targetSupervisedTree.has(d));
    if (targetSupervisesCallerHome || overlapInSupervisedArea) {
      return void res.status(403).json({
        message: "Forbidden (cannot edit a supervisor who can act on you / within your supervised area)",
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1) Who may edit this target? (existing logic, with subtree override)
  // ─────────────────────────────────────────────────────────────
  if (!isTop) {
    const allowedTargets = new Set(getAllDescendantRoles(callerRole));
    if (!allowedTargets.has(target.role as SystemRole)) {
      // Allow if caller supervises the target's dept (within caller's supervised subtree)
      if (!(callerIsSupervisor && targetDeptId && callerSupervisedTree.has(String(targetDeptId)))) {
        return void res.status(403).json({ message: "Forbidden (role hierarchy)" });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2) Parse inputs - IMPORTANT: Handle role normalization like createUser
  // ─────────────────────────────────────────────────────────────
  const {
    fullName, username, email, phone, role: incomingRole, department, rank,
    // Governance
    makeSupervisor,
    supervisorDepartmentIds = [],
    setAsHead,
    headDepartmentIds = [],
    removeSupervisorFrom = [],
    clearHeadFrom = [],
  } = req.body;

  // Normalize departments to string[] for role checking
  const deptIds: string[] = department !== undefined
    ? (Array.isArray(department) ? department.map(String) : [String(department)])
    : target.department ? [String(target.department)] : [];

  // ─────────────────────────────────────────────────────────────
  // 3) ROLE NORMALIZATION (Like createUser)
  // ─────────────────────────────────────────────────────────────
  const SYSTEM_ROLE_FALLBACK: SystemRole = "Middle & Junior Staff";
  let roleToSave: SystemRole | undefined;

  if (incomingRole !== undefined) {
    const rawRole = incomingRole.toString().trim();
    
    if (rawRole) {
      let deptRoleFound = false;

      // 1) Try as a department role NAME within provided departments
      if (deptIds.length) {
        const inScope = await DeptRole.findOne({
          department: { $in: deptIds },
          name: rawRole,
          isActive: true,
        })
          .collation({ locale: "en", strength: 2 })
          .select("_id")
          .lean();

        if (inScope) {
          deptRoleFound = true;
          roleToSave = SYSTEM_ROLE_FALLBACK; // Store valid system role
        }
      }

      // 2) If not found in provided departments, try ANY department
      if (!deptRoleFound) {
        const anyDept = await DeptRole.findOne({
          name: rawRole,
          isActive: true,
        })
          .collation({ locale: "en", strength: 2 })
          .select("_id")
          .lean();

        if (anyDept) {
          deptRoleFound = true;
          roleToSave = SYSTEM_ROLE_FALLBACK;
        }
      }

      // 3) If still not found, try as a SYSTEM role
      if (!deptRoleFound) {
        if (ALL_ROLES_ARRAY.includes(rawRole)) {
          roleToSave = rawRole as SystemRole;
        } else {
          return void res.status(400).json({ 
            message: "Invalid role (not a system role and no matching department role)" 
          });
        }
      }
    } else {
      // Empty role string - use fallback
      roleToSave = SYSTEM_ROLE_FALLBACK;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4) Role change rules (non-Top callers) - UPDATED for dynamic roles
  // ─────────────────────────────────────────────────────────────
  if (roleToSave !== undefined && !isTop) {
    const allowedTargets = new Set(getAllDescendantRoles(callerRole));
    let roleAllowed = allowedTargets.has(roleToSave as SystemRole);

    // Allow department roles within supervised scope (except top 4 roles)
    if (
      !roleAllowed &&
      callerIsSupervisor &&
      targetDeptId &&
      !TOP4_ROLES.includes(roleToSave) &&
      callerSupervisedTree.has(String(targetDeptId))
    ) {
      // Check if it's a department role
      const isDeptRole = await DeptRole.findOne({
        name: incomingRole.toString().trim(),
        isActive: true,
      });
      
      if (isDeptRole) {
        roleAllowed = true;
      }
    }

    if (!roleAllowed) {
      return void res.status(403).json({ message: "Forbidden (cannot set this role)" });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5) Changing home department? (single) – merge org scope + supervised subtree
  // ─────────────────────────────────────────────────────────────
  if (department !== undefined && !isTop) {
    const newDeptIds: string[] = Array.isArray(department) ? department.map(String) : [String(department)];
    const baseAccessible = await getAccessibleDepartmentIdsForStrings(caller);
    const accessibleSet = new Set<string>(baseAccessible.map(String));
    for (const id2 of callerSupervisedTree) accessibleSet.add(String(id2));

    const forbidden = newDeptIds.filter((d) => !accessibleSet.has(d));
    if (forbidden.length) {
      return void res.status(403).json({
        message: "Forbidden (department out of scope)",
        departments: forbidden,
      });
    }
  }

  // Apply basic fields (home department: first if array)
  const nextDept = department !== undefined
    ? (Array.isArray(department) ? department[0] : department) || undefined
    : target.department;

  Object.assign(target, {
    ...(fullName !== undefined ? { fullName } : {}),
    ...(username !== undefined ? { username } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(roleToSave !== undefined ? { role: roleToSave } : {}), // Use normalized role
    ...(department !== undefined ? { department: nextDept } : {}),
    ...(rank !== undefined ? { rank } : {}),
  });
  await target.save();

  // ─────────────────────────────────────────────────────────────
  // 6) Governance updates (Supervisor / Head) - UNCHANGED
  // ─────────────────────────────────────────────────────────────
  const supIds = (supervisorDepartmentIds || []).map(String);
  const rmSupIds = (removeSupervisorFrom || []).map(String);
  const headIds = (headDepartmentIds || []).map(String);
  const clrHeadIds = (clearHeadFrom || []).map(String);

  // Non–Super Admin must provide supervisorDepartmentIds when assigning supervisor
  if (!callerIsSuper && makeSupervisor === true && supIds.length === 0) {
    return void res.status(400).json({
      message: "supervisorDepartmentIds are required when assigning supervisor (non–Super Admin).",
    });
  }

  const toObjIds = (arr: string[]) => arr.map((x) => new Types.ObjectId(String(x)));

  if (!isTop) {
    // For non-Top: supervisor edits only inside caller's supervised subtree
    const allTouched = [...supIds, ...rmSupIds];
    const notSupervisedHere = allTouched.filter((d) => !callerSupervisedTree.has(String(d)));
    if (notSupervisedHere.length) {
      return void res.status(403).json({
        message: "You can only modify supervisors for departments you supervise.",
        departments: notSupervisedHere,
      });
    }
    // Only Top roles can change Heads
    if (setAsHead || headIds.length || clrHeadIds.length) {
      return void res.status(403).json({ message: "Only top roles can change Heads." });
    }
  }

  // Super Admin global toggle without dept IDs
  if (callerIsSuper && makeSupervisor === true && supIds.length === 0 && rmSupIds.length === 0) {
    if (!(target as any).isSupervisor) {
      (target as any).isSupervisor = true;
      await target.save();
    }
    await syncUserSupervisorMirror(target._id as Types.ObjectId);
  }
  if (callerIsSuper && makeSupervisor === false && supIds.length === 0 && rmSupIds.length === 0) {
    if ((target as any).isSupervisor) {
      (target as any).isSupervisor = false;
      await target.save();
    }
    await syncUserSupervisorMirror(target._id as Types.ObjectId);
  }

  // Supervisor add/remove (subtree-limited)
  if (makeSupervisor === true && supIds.length) {
    for (const depId of toObjIds(supIds)) {
      await Department.addSupervisor(depId, target._id as Types.ObjectId);
    }
    await syncUserSupervisorMirror(target._id as Types.ObjectId);
  }
  if (rmSupIds.length) {
    for (const depId of toObjIds(rmSupIds)) {
      await Department.removeSupervisor(depId, target._id as Types.ObjectId);
    }
    await syncUserSupervisorMirror(target._id as Types.ObjectId);
  }

  // Head add/remove (TOP only)
  if (isTop && setAsHead === true && headIds.length) {
    for (const depId of toObjIds(headIds)) {
      await Department.setHead(depId, target._id as Types.ObjectId);
    }
  }
  if (isTop && clrHeadIds.length) {
    for (const depId of toObjIds(clrHeadIds)) {
      await Department.setHead(depId, null);
    }
  }

  const fresh = await User.findById(target._id);
  res.status(200).json({ message: "User updated", user: fresh });
};