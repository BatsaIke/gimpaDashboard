// utils/departments.ts
import { Types } from "mongoose";
import Department from "../models/Department";
import { isTopRole } from "../utils/rolesAccess";

/**
 * Minimal shape the helpers need.
 * Works for User, Employee, or any auth payload with these fields.
 */
export type MinimalAuth = {
  _id: Types.ObjectId | string;
  role: string;
  /** department can be: string | ObjectId | {_id} | array of the same | undefined */
  department?: any;
};

/** Safely coerce anything id-like to an ObjectId (or null). */
function toObjectId(x: any): Types.ObjectId | null {
  if (!x) return null;
  if (x instanceof Types.ObjectId) return x;
  if (typeof x === "object" && "_id" in x && Types.ObjectId.isValid(String((x as any)._id))) {
    return new Types.ObjectId(String((x as any)._id));
  }
  const s = String(x);
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
}

/** Normalize any dept id shape to ObjectId[] (supports string | ObjectId | {_id} | array). */
function normalizeDeptIds(input: any): Types.ObjectId[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(toObjectId).filter(Boolean) as Types.ObjectId[];
  }
  const one = toObjectId(input);
  return one ? [one] : [];
}

/** Return all department _ids the user can see (membership ∪ supervised ∪ descendants). */
export async function getAccessibleDepartmentIdsFor(
  user: MinimalAuth
): Promise<Types.ObjectId[]> {
  if (isTopRole(user.role)) {
    const all = await Department.find().select("_id").lean();
    return all.map((d) => d._id as Types.ObjectId);
  }

  const uid = toObjectId(user._id)!;

  // Membership can be single or multi; support both.
  const memberIds = normalizeDeptIds(user.department);

  // Departments explicitly supervised by this user
  const supervised = await Department.find({ supervisors: uid }).select("_id").lean();
  const supervisedIds = supervised.map((d) => d._id as Types.ObjectId);

  // Base set = membership ∪ supervised
  const base = Array.from(new Set([...memberIds, ...supervisedIds].map(String))).map(
    (s) => new Types.ObjectId(s)
  );

  if (!base.length) return [];

  // Materialized-path subtree: node itself OR any node with an ancestor in base
  const subtree = await Department.find({
    $or: [{ _id: { $in: base } }, { ancestors: { $in: base } }],
  })
    .select("_id")
    .lean();

  return subtree.map((d) => d._id as Types.ObjectId);
}

/** Convenience: same as above, but returns string ids (handy for comparisons/UI). */
export async function getAccessibleDepartmentIdsForStrings(user: MinimalAuth): Promise<string[]> {
  const ids = await getAccessibleDepartmentIdsFor(user);
  return ids.map(String);
}

/** Quick boolean: does the user have scope over a given department id? */
export async function hasDepartmentScope(
  user: MinimalAuth,
  deptId: string | Types.ObjectId
): Promise<boolean> {
  if (isTopRole(user.role)) return true;
  const scope = await getAccessibleDepartmentIdsForStrings(user);
  return scope.includes(String(deptId));
}

/** Rebuild ancestors for a node’s descendants (use after changing parent). */
export async function rebuildAncestors(rootId: Types.ObjectId) {
  type WithAncestors = { _id: Types.ObjectId; ancestors?: Types.ObjectId[] };

  const root = await Department.findById(rootId).select("_id ancestors").lean<WithAncestors>();
  if (!root) return;

  const queue: Array<{ id: Types.ObjectId; ancestors: Types.ObjectId[] }> = [
    { id: rootId, ancestors: root.ancestors || [] },
  ];

  // BFS over descendants
  while (queue.length) {
    const { id, ancestors } = queue.shift()!;
    const children = await Department.find({ parent: id }).select("_id").lean();

    for (const child of children) {
      const newAnc = [...ancestors, id];
      await Department.updateOne({ _id: child._id }, { $set: { ancestors: newAnc } });
      queue.push({ id: child._id as Types.ObjectId, ancestors: newAnc });
    }
  }
}

/**
 * Build a Mongo filter for models that reference department(s).
 * NOTE: Adjust the field name if your target model uses `department` (singular)
 * rather than `departments` (plural).
 */
export async function departmentScopeFilter(user: MinimalAuth) {
  if (isTopRole(user.role)) return {}; // no restriction
  const ids = await getAccessibleDepartmentIdsFor(user);
  // If your model uses a singular field, change to { department: { $in: ids } }
  return ids.length ? { departments: { $in: ids } } : { _id: { $exists: false } };
}
