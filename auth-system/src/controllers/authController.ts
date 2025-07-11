import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateToken, generateRefreshToken } from "../utils/authUtils";
import {
  ALL_ROLES_ARRAY,
  SystemRole,
  isSuperAdmin,
  getAccessibleRoles,
} from "../utils/rolesAccess";

/* ------------------------------------------------------------------
 * 1. Helpers
 * ------------------------------------------------------------------ */
const DEFAULT_PASSWORD = "1234567@";

function roleGuard(allowed: SystemRole[], caller?: string): boolean {
  return (
    !!caller && (isSuperAdmin(caller) || allowed.includes(caller as SystemRole))
  );
} 

export const signupSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const exists = await User.exists({ role: "Super Admin" });
  if (exists) {
    res.status(403).json({ message: "Super Admin already exists" });
    return; // <- exit early but don’t return the res object
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
  // No return statement here!
};

/* ------------------------------------------------------------------
 * 2. AUTH – login + refresh
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
 * 3. USER MANAGEMENT – Super Admin creates anyone
 * ------------------------------------------------------------------ */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!isSuperAdmin(req.authUser?.role)) {
    res.status(403).json({ message: 'Only Super Admin can create users' });
    return;
  }

  const { username, fullName, email, phone, password, role, department, rank } = req.body;
  if (!role) {
    res.status(400).json({ message: 'Role is required' });
    return;
  }
  if (!ALL_ROLES_ARRAY.includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  const dupe = await User.findOne({ $or: [{ email }, { phone }, { username }] });
  if (dupe) {
    res.status(400).json({ message: 'User already exists (email/phone/username)' });
    return;
  }

  const user = await User.create({
    username,
    fullName,
    email,
    phone,
    password: password ?? DEFAULT_PASSWORD,
    role,
    department,
    rank
  });

  res.status(201).json({ message: 'User created', user });
  return;
};

export const getStaff = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const callerRole = req.authUser?.role as SystemRole;
  const accessible = isSuperAdmin(callerRole)
    ? ALL_ROLES_ARRAY
    : getAccessibleRoles(callerRole);
  const staff = await User.find({ role: { $in: accessible } }).populate(
    "department",
    "name"
  );
  res.status(200).json(staff);
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(id).populate("department", "name");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json(user);
};
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const caller = req.authUser?.role as SystemRole;
  const target = await User.findById(id);
  if (!target) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (!isSuperAdmin(caller) && !getAccessibleRoles(caller).includes(target.role as SystemRole)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  const { fullName, username, email, phone, role, department, rank } = req.body;
  Object.assign(target, { fullName, username, email, phone, role, department, rank });
  await target.save();

  res.status(200).json({ message: 'User updated', user: target });
  return;
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

  res.status(200).json({ message: `Password reset to ${DEFAULT_PASSWORD}` });
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
