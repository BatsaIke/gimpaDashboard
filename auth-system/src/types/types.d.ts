// types/types.ts
import { Request } from 'express';
import { Types } from 'mongoose';
import { SystemRole } from '../utils/rolesAccess';

export interface DepartmentPayload {
  _id: Types.ObjectId;
  name?: string;
}

export interface UserPayload {
  _id: Types.ObjectId;
  id?: string;
  role: SystemRole;
  school?: string;
  department?: string | DepartmentPayload;
  modelType: 'User' | 'Employee';
}

export interface AuthRequest extends Request {
  authUser?: UserPayload;
}

// ✅ alias for clarity
export type AuthUser = UserPayload;
