// src/controllers/authController.ts
import { Request, Response } from "express";
import DeptRole from "../../models/DeptRole";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { AuthRequest } from "../../middleware/authMiddleware";
import { generateToken, generateRefreshToken } from "../../utils/authUtils";
import {
  ALL_ROLES_ARRAY,
  SystemRole,
  isSuperAdmin,
  getAccessibleRoles,
  getAllDescendantRoles,
  isTopRole,
} from "../../utils/rolesAccess";
import Department from "../../models/Department";
import {
  getAccessibleDepartmentIdsFor,
  getAccessibleDepartmentIdsForStrings,
} from "../../utils/departments";
import { Types } from "mongoose";
import { log } from "console";

const DEFAULT_PASSWORD = "1234567@";


const TOP4_ROLES: SystemRole[] = [
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
];
const isTopFourRole = (r: any): r is SystemRole =>
  TOP4_ROLES.includes(r as SystemRole);


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


/* ------------------------------------------------------------------ */
/* SUPER-ADMIN SIGNUP                                                  */
/* ------------------------------------------------------------------ */
export const signupSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exists = await User.exists({ role: "Super Admin" });
  if (exists) {
    res.status(403).json({ message: "Super Admin already exists" });
    return;
  }

  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "Super Admin",
  });

  res.status(201).json({ message: "Super Admin created", user });
};

/* ------------------------------------------------------------------ */
/* LOGIN / REFRESH                                                     */
/* ------------------------------------------------------------------ */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { text, password } = req.body;

  const query = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)
    ? { email: text }
    : /^[0-9]{10}$/.test(text)
    ? { phone: text }
    : { username: text };

  const user = await User.findOne(query).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user._id.toString(), user.role, "1h");
  const refreshToken = generateRefreshToken(user._id.toString(), "7d");
  res.status(200).json({ token, refreshToken, role: user.role });
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const newAccess = generateToken(user._id.toString(), user.role, "1h");
    const newRefresh = generateRefreshToken(user._id.toString(), "7d");
    res.status(200).json({ token: newAccess, refreshToken: newRefresh });
  } catch (err: any) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Refresh expired"
        : "Invalid refresh token";
    res.status(401).json({ message: msg });
  }
};



export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const caller = req.authUser;
  if (!caller) return void res.status(401).json({ message: "Unauthorized" });

  const {
    username, fullName, email, phone, password,
    role: incomingRole, department, rank, makeSupervisor,
  } = req.body;

  // Normalize departments to string[]
  const deptIds: string[] = Array.isArray(department)
    ? department.map(String)
    : department ? [String(department)] : [];

  // ---- Role normalization (incoming text takes priority) ----
  const SYSTEM_ROLE_FALLBACK: SystemRole = "Middle & Junior Staff"; // must exist in ALL_ROLES_ARRAY
  const rawRole = (incomingRole ?? "").toString().trim();

  let roleToSave: SystemRole = SYSTEM_ROLE_FALLBACK;

  if (rawRole) {
    // 1) Try as a department role NAME (case-insensitive) within provided departments
    let deptRoleFound = false;

    if (deptIds.length) {
      const inScope = await DeptRole.findOne({
        department: { $in: deptIds },
        name: rawRole,
        isActive: true,
      })
        .collation({ locale: "en", strength: 2 }) // case-insensitive
        .select("_id")
        .lean();

      if (inScope) {
        deptRoleFound = true;
        roleToSave = SYSTEM_ROLE_FALLBACK; // store a valid system role; dept-role assignment is separate
      }
    }

    // 2) If not found in provided departments, try ANY department (still dept-role name)
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
        return void res
          .status(400)
          .json({ message: "Invalid role (not a system role and no matching department role)" });
      }
    }
  } else {
    // No incoming role — use fallback system role
    roleToSave = SYSTEM_ROLE_FALLBACK;
  }

  // ---- Scope & permission checks (unchanged) ----
  const top = isTopRole(caller.role as SystemRole);
  const callerIsSuper = isSuperAdmin(caller.role as SystemRole);

  const callerSupervisedTreeArr = await getSupervisedTreeDeptIdStrings(caller._id as Types.ObjectId);
  const callerSupervisedTree = new Set(callerSupervisedTreeArr.map(String));
  const callerIsSupervisor = callerSupervisedTree.size > 0 || !!(caller as any).isSupervisor;

  const baseAccessible = await getAccessibleDepartmentIdsForStrings(caller);
  const accessibleSet = new Set<string>(baseAccessible.map(String));
  for (const id of callerSupervisedTree) accessibleSet.add(String(id));

  if (!top) {
    const outOfScope = deptIds.filter((id) => !accessibleSet.has(String(id)));
    if (outOfScope.length) {
      return void res.status(403).json({
        message: "You can only create users inside your department scope",
        departments: outOfScope,
      });
    }
  }

  const allowedTargets = new Set(getAllDescendantRoles(caller.role as SystemRole));
  const allInCallerSupScope =
    callerIsSupervisor && deptIds.length > 0 && deptIds.every((d) => callerSupervisedTree.has(String(d)));

  const roleAllowed =
    top ||
    allowedTargets.has(roleToSave as SystemRole) ||
    (allInCallerSupScope && !isTopFourRole(roleToSave));

  if (!roleAllowed) {
    return void res.status(403).json({
      message: "You cannot create this role",
      allowedTargets: [...allowedTargets],
    });
  }

  if (!callerIsSuper && (makeSupervisor === true) && deptIds.length === 0) {
    return void res.status(400).json({
      message: "Departments are required when assigning supervisor (non–Super Admin).",
    });
  }

  const dupe = await User.findOne({ $or: [{ email }, { phone }, { username }] });
  if (dupe) {
    return void res.status(400).json({ message: "User already exists (email/phone/username)" });
  }

  // Create user (home department = first if many)
  const user = await User.create({
    username, fullName, email, phone,
    password: password ?? DEFAULT_PASSWORD,
    role: roleToSave,
    department: deptIds.length ? deptIds[0] : undefined,
    rank,
  });

  // Governance
  if (deptIds.length) {
    const deptObjIds = deptIds.map((id) => new Types.ObjectId(String(id)));

    if (makeSupervisor === true) {
      if (callerIsSuper) {
        for (const depId of deptObjIds) {
          await Department.addSupervisor(depId, user._id as Types.ObjectId);
        }
      } else if (callerIsSupervisor) {
        const outOfSupScope = deptIds.filter((d) => !callerSupervisedTree.has(String(d)));
        if (outOfSupScope.length) {
          return void res.status(403).json({
            message:
              "Only Super Admin can assign supervisors globally. Supervisors may assign only within departments they supervise.",
            departments: outOfSupScope,
          });
        }
        for (const depId of deptObjIds) {
          await Department.addSupervisor(depId, user._id as Types.ObjectId);
        }
      } else {
        return void res.status(403).json({
          message:
            "Only Super Admin or an existing Supervisor (within their supervised departments) may assign supervisor.",
        });
      }
      await syncUserSupervisorMirror(user._id as Types.ObjectId);
    }

    if (top && makeSupervisor !== true) {
      for (const depId of deptObjIds) {
        await Department.setHead(depId, user._id as Types.ObjectId);
      }
    }
  }

  res.status(201).json({ message: "User created", user });
};









/* ------------------------------------------------------------------ */
/* READ / UPDATE / DELETE                                              */
/* ------------------------------------------------------------------ */
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const caller = req.authUser!;
  const callerRole = caller.role as SystemRole;

  const user = await User.findById(id).populate("department", "name");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Self can always read self
  if (String(user._id) === String(caller._id)) {
    res.status(200).json(user);
    return;
  }

  // Top roles can read anyone
  if (isTopRole(callerRole)) {
    res.status(200).json(user);
    return;
  }

  // Non-top: role hierarchy guard (transitive)
  const allowedTargets = new Set(getAllDescendantRoles(callerRole));
  if (!allowedTargets.has(user.role as SystemRole)) {
    res.status(403).json({ message: "Forbidden (role hierarchy)" });
    return;
  }

  // Department subtree guard
  const accessibleDeptIds = await getAccessibleDepartmentIdsForStrings(caller);
  const targetDeptIds: string[] = user.department
    ? [
        typeof (user as any).department === "object" &&
        (user as any).department?._id
          ? String((user as any).department._id)
          : String((user as any).department),
      ]
    : [];

  if (
    targetDeptIds.length &&
    targetDeptIds.some((d) => !accessibleDeptIds.includes(d))
  ) {
    res.status(403).json({ message: "Forbidden (department out of scope)" });
    return;
  }

  res.status(200).json(user);
};









export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const caller = req.authUser?.role as SystemRole;
  const target = await User.findById(id);
  if (!target) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (
    !isSuperAdmin(caller) &&
    !getAccessibleRoles(caller).includes(target.role as SystemRole)
  ) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await target.deleteOne();
  res.status(200).json({ message: "User deleted" });
};

/* ------------------------------------------------------------------ */
/* PASSWORD OPS                                                        */
/* ------------------------------------------------------------------ */
export const resetPassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const target = await User.findById(id);
  if (!target) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  target.password = DEFAULT_PASSWORD;
  await target.save();

  res
    .status(200)
    .json({ message: `Password reset to ${DEFAULT_PASSWORD}` });
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(id).select("+password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (!(await bcrypt.compare(oldPassword, user.password))) {
    res.status(400).json({ message: "Old password incorrect" });
    return;
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password changed" });
};

/* ------------------------------------------------------------------ */
/* LIST STAFF                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* LIST STAFF                                                          */
/* ------------------------------------------------------------------ */
export const getStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const caller = req.authUser!;
  const callerRole = caller.role as SystemRole;

  // Department scope (unchanged: full subtree you already compute)
  const accessibleDeptIds = await getAccessibleDepartmentIdsFor(req.authUser!);

  // Build department filter only if we actually have scoped ids
  let deptFilter: any = {};
  if (!isTopRole(callerRole) && accessibleDeptIds.length) {
    deptFilter = {
      $or: [
        { department: { $in: accessibleDeptIds } }, // in my subtree
        { department: { $exists: false } },         // top-level/no dept
        { department: { $eq: null } },
      ],
    };
  }

  // ----- Role filter logic -----
  // TOP roles: can see everyone
  if (isTopRole(callerRole)) {
    const staff = await User.find({ ...deptFilter }).populate("department", "name");
    return void res.status(200).json(staff);
  }

  // If caller is a supervisor, **do not** restrict by role — department scope is enough.
  // This lets Heads/Directors see *all* people in their supervised departments (including other Heads).
  const isCallerSupervisor = !!caller.isSupervisor;

  let roleFilter: any = {};
  if (!isCallerSupervisor) {
    // Non-top, non-supervisor: restrict to descendants **plus** own role so they can see peers of the same role.
    const descendants = new Set(getAllDescendantRoles(callerRole));
    descendants.add(callerRole as SystemRole);
    roleFilter = { role: { $in: Array.from(descendants) } };
  }

  const staff = await User.find({
    ...roleFilter,   // empty object if supervisor → no role restriction
    ...deptFilter,
  }).populate("department", "name");

  res.status(200).json(staff);
};


/* ------------------------------------------------------------------ */
/* ME                                                                  */
/* ------------------------------------------------------------------ */
// in getMe
export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.authUser) return void res.status(401).json({ message: "Unauthorized" });

  const me = await User.findById(req.authUser._id)
    .select("_id username fullName email phone role department isSupervisor supervisedDepartments")
    .populate("department", "name")                 // 👈 ensure department is an object
    .populate("supervisedDepartments", "name parent") // 👈 optional: gives you supervisedDepartments as objects too
    .lean();

  const headOf = await Department.find({ head: me!._id })
    .select("_id name parent")
    .lean();

  // Prefer mirror; fall back to reverse lookup
  let supervisorOf: any[] = [];
  if (Array.isArray(me?.supervisedDepartments) && me.supervisedDepartments.length) {
    // If populated above, elements are objects already; if not, this still works with ObjectIds
    const ids = me.supervisedDepartments.map((d: any) => String(d?._id || d));
    supervisorOf = await Department.find({ _id: { $in: ids } })
      .select("_id name parent")
      .lean();
  } else {
    supervisorOf = await Department.find({ supervisors: me!._id })
      .select("_id name parent")
      .lean();
  }

  const headIds = headOf.map((d) => d._id);
  const headSubtree = headIds.length
    ? await Department.find({ ancestors: { $in: headIds } })
        .select("_id name parent ancestors")
        .lean()
    : [];

  res.status(200).json({
    ...me,
    headOf,
    supervisorOf,          // 👈 render-ready
    headSubtree,
    // Optional convenience: expose a populated copy by a clear name
    supervisedDepartmentsPop: me?.supervisedDepartments || [], // 👈 objects if populated above
  });
};

