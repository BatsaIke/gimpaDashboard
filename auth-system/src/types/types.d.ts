import { Request } from 'express';
import { Types } from 'mongoose';
import { SystemRole } from '../utils/rolesAccess';

interface DepartmentPayload {
  _id: Types.ObjectId;
  name?: string;
}

interface UserPayload {
  _id: Types.ObjectId;
  id?: string;
  role: SystemRole
  school?: string;
  department?: string | DepartmentPayload;
  modelType: 'User' | 'Employee'; // Add this field
}

export interface AuthRequest extends Request {
  authUser?: UserPayload;
}