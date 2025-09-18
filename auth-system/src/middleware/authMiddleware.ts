// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import { IDepartment } from '../models/Department';
import { SystemRole } from '../utils/rolesAccess';

function isPopulatedDepartment(doc: unknown): doc is IDepartment {
  return !!doc && typeof doc === 'object' && '_id' in (doc as any) && 'name' in (doc as any);
}

export interface AuthUser {
  _id: Types.ObjectId;
  fullName?: string;
  username?: string;
  email?: string | null;
  phone?: string | null;
  role: SystemRole;
  modelType: 'User';
  department?: Types.ObjectId | { _id: Types.ObjectId; name: string };

  // 🔵 add these mirror fields so controllers can check supervisor privileges
  isSupervisor: boolean;
  supervisedDepartments: Types.ObjectId[]; // ids only (we don’t need names in middleware)
}

export interface AuthRequest extends Request {
  authUser?: AuthUser;
  tokenExpired?: boolean;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const bearer = req.header('Authorization');
  const token = bearer?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      exp?: number;
      iat?: number;
    };

    const user = await User.findById<IUser>(decoded.id)
      .populate<{ department: IDepartment | Types.ObjectId | undefined }>('department')
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const authUser: AuthUser = {
      _id: user._id as Types.ObjectId,
      fullName: user.fullName,
      username: user.username,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role as SystemRole,
      modelType: 'User',
      // 🔵 mirror flags
      isSupervisor: !!user.isSupervisor,
      supervisedDepartments: Array.isArray(user.supervisedDepartments)
        ? (user.supervisedDepartments as Types.ObjectId[])
        : [],
    };

    if (user.department) {
      if (isPopulatedDepartment(user.department)) {
        authUser.department = {
          _id: user.department._id as Types.ObjectId,
          name: user.department.name,
        };
      } else {
        authUser.department = user.department as Types.ObjectId;
      }
    }

    req.authUser = authUser;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
          ignoreExpiration: true,
        }) as { id: string; role: string; exp: number };

        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          const user = await User.findById<IUser>(decoded.id)
            .populate<{ department: IDepartment | Types.ObjectId | undefined }>('department')
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

          if (user) {
            const authUser: AuthUser = {
              _id: user._id as Types.ObjectId,
              fullName: user.fullName,
              username: user.username,
              email: user.email ?? null,
              phone: user.phone ?? null,
              role: user.role as SystemRole,
              modelType: 'User',
              isSupervisor: !!user.isSupervisor,
              supervisedDepartments: Array.isArray(user.supervisedDepartments)
                ? (user.supervisedDepartments as Types.ObjectId[])
                : [],
            };

            if (user.department) {
              if (isPopulatedDepartment(user.department)) {
                authUser.department = {
                  _id: user.department._id as Types.ObjectId,
                  name: user.department.name,
                };
              } else {
                authUser.department = user.department as Types.ObjectId;
              }
            }

            req.authUser = authUser;
            req.tokenExpired = true;
            next();
            return;
          }
        }
      } catch { /* fall through */ }
      res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Token expired' });
      return;
    }

    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    next(err);
  }
};
