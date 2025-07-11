// src/controllers/roleController.ts – FINAL (handlers return void)
import { RequestHandler } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  ALL_ROLES_ARRAY,
  SystemRole,
  DIRECT_REPORTS,
  getAccessibleRoles,
  isSuperAdmin
} from '../utils/rolesAccess';

type MutableReportsMap = Partial<Record<SystemRole, SystemRole[]>>;
const isValidRoleName = (name: string): name is SystemRole =>
  (ALL_ROLES_ARRAY as readonly string[]).includes(name);
const PROTECTED: readonly SystemRole[] = [
  'Super Admin',
  'Rector',
  'Deputy Rector',
  'Secretary of the Institute',
  'Director of Internal Audit'
];
const isProtectedRole = (r: SystemRole) => PROTECTED.includes(r);

/* ---------------- 1. Public list ---------------- */
export const getAllRoles: RequestHandler = (_req, res) => {
  res.status(200).json({ success: true, data: ALL_ROLES_ARRAY, hierarchy: DIRECT_REPORTS });
};

/* ---------------- 2. Accessible list ------------- */
export const getMyAccessibleRoles: RequestHandler = (req, res) => {
  const caller = (req as AuthRequest).authUser?.role as SystemRole | undefined;
  if (!caller) {
    res.status(403).json({ success: false, message: 'No user role found' });
    return;
  }

  if (!isValidRoleName(caller)) {
    res.status(403).json({ success: false, message: 'Invalid user role' });
    return;
  }

  if (isSuperAdmin(caller)) {
    res.status(200).json({
      success: true,
      data: ALL_ROLES_ARRAY.filter((r) => r !== 'Super Admin')
    });
    return;
  }

  const accessible = getAccessibleRoles(caller).filter(r => r !== caller);
  res.status(200).json({
    success: true,
    data: accessible
  });
};


/* ---------------- 3. CREATE ----------------------- */
export const createRole: RequestHandler = (req, res) => {
  const auth = (req as AuthRequest).authUser;
  if (!auth || !isSuperAdmin(auth.role as SystemRole)) {
    res.status(403).json({ success: false, message: 'Only Super Admin can create roles' });
    return;
  }
  const { role, reportsTo } = req.body as { role?: string; reportsTo?: string };
  if (!role) {
    res.status(400).json({ success: false, message: 'Role name is required' });
    return;
  }
  if (isValidRoleName(role)) {
    res.status(400).json({ success: false, message: 'Role already exists' });
    return;
  }
  if (reportsTo && !isValidRoleName(reportsTo)) {
    res.status(400).json({ success: false, message: 'Invalid parent role specified' });
    return;
  }
  const newRole = role as SystemRole;
  (ALL_ROLES_ARRAY as SystemRole[]).push(newRole);
  const map = DIRECT_REPORTS as MutableReportsMap;
  if (reportsTo) {
    const parent = reportsTo as SystemRole;
    if (!map[parent]) map[parent] = [];
    map[parent]!.push(newRole);
  } else {
    map[newRole] = [];
  }
  res.status(201).json({ success: true, message: 'Role created', data: { role: newRole, reportsTo: reportsTo ?? null } });
};

/* ---------------- 4. UPDATE ----------------------- */
export const updateRole: RequestHandler = (req, res) => {
  const auth = (req as AuthRequest).authUser;
  if (!auth || !isSuperAdmin(auth.role as SystemRole)) {
    res.status(403).json({ success: false, message: 'Only Super Admin can update roles' });
    return;
  }
  const { roleName } = req.params;
  const { newName, newReportsTo } = req.body as { newName?: string; newReportsTo?: string | null };
  if (!isValidRoleName(roleName)) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  const oldRole = roleName as SystemRole;
  if (isProtectedRole(oldRole)) {
    res.status(403).json({ success: false, message: 'Protected roles cannot be modified' });
    return;
  }
  if (newName && isValidRoleName(newName)) {
    res.status(400).json({ success: false, message: 'New role name already exists' });
    return;
  }
  if (newReportsTo && newReportsTo !== null && !isValidRoleName(newReportsTo)) {
    res.status(400).json({ success: false, message: 'Invalid parent role specified' });
    return;
  }
  const map = DIRECT_REPORTS as MutableReportsMap;
  const updatedRole = (newName ? newName : oldRole) as SystemRole;
  if (newName) {
    const idx = ALL_ROLES_ARRAY.indexOf(oldRole);
    if (idx !== -1) (ALL_ROLES_ARRAY as SystemRole[])[idx] = updatedRole;
  }
  for (const p in map) {
    const list = map[p as SystemRole];
    if (list && list.includes(oldRole)) map[p as SystemRole] = list.filter(r => r !== oldRole);
  }
  if (newReportsTo) {
    const parent = newReportsTo as SystemRole;
    if (!map[parent]) map[parent] = [];
    map[parent]!.push(updatedRole);
  }
  if (newName) {
    map[updatedRole] = map[oldRole] ?? [];
    delete map[oldRole];
  }
  res.status(200).json({ success: true, message: 'Role updated', data: { oldName: oldRole, newName: updatedRole, reportsTo: newReportsTo ?? null } });
};

/* ---------------- 5. DELETE ----------------------- */
export const deleteRole: RequestHandler = (req, res) => {
  const auth = (req as AuthRequest).authUser;
  if (!auth || !isSuperAdmin(auth.role as SystemRole)) {
    res.status(403).json({ success: false, message: 'Only Super Admin can delete roles' });
    return;
  }
  const { roleName } = req.params;
  if (!isValidRoleName(roleName)) {
    res.status(404).json({ success: false, message: 'Role not found' });
    return;
  }
  const role = roleName as SystemRole;
  if (isProtectedRole(role)) {
    res.status(403).json({ success: false, message: 'Protected roles cannot be deleted' });
    return;
  }
  const map = DIRECT_REPORTS as MutableReportsMap;
  if (map[role]?.length) {
    res.status(400).json({ success: false, message: 'Cannot delete role with direct reports', reports: map[role] });
    return;
  }
  if (Object.values(map).some(list => list?.includes(role))) {
    res.status(400).json({ success: false, message: 'Role is referenced in hierarchy' });
    return;
  }
  ALL_ROLES_ARRAY.splice(ALL_ROLES_ARRAY.indexOf(role), 1);
  delete map[role];
  res.status(200).json({ success: true, message: 'Role deleted', data: role });
}; 