// src/middleware/authMiddleware.ts – FINAL, type-safe, RequestHandler-compatible
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import { IDepartment } from '../models/Department';

/* --------------------------------------------------------------
 * Type guard – checks populated Department docs
 * -------------------------------------------------------------- */
function isPopulatedDepartment(doc: unknown): doc is IDepartment {
  return !!doc && typeof doc === 'object' && '_id' in doc && 'name' in doc;
}

/* --------------------------------------------------------------
 * AuthUser interface exposed to route handlers
 * -------------------------------------------------------------- */
interface AuthUser {
  _id: string;
  fullName?: string;
  username?: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  modelType: 'User'; 
  department?: string | { _id: string; name: string };
}

export interface AuthRequest extends Request {
  authUser?: AuthUser;
}

/* --------------------------------------------------------------
 * verifyToken – Express middleware (async RequestHandler)  ✅
 *   • returns **void** (or calls next) -> satisfies Express types
 * -------------------------------------------------------------- */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const bearer = req.header('Authorization');
  const token = bearer?.split(' ')[1];

  if (!token) {
    res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    /* Explicit generic ✨ gives TypeScript the correct document type */
    const user = await User.findById<IUser>(decoded.id)
      .populate<{ department: IDepartment | Types.ObjectId | undefined }>('department')
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const authUser: AuthUser = {
  _id: (user._id as Types.ObjectId).toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email ?? null,
  phone: user.phone ?? null,
  role: user.role,
  modelType: 'User'
};

    /* Attach department (either populated or ObjectId) */
    if (user.department) {
      if (isPopulatedDepartment(user.department)) {
        authUser.department = {
          _id: (user.department._id as Types.ObjectId).toString(),
          name: user.department.name
        };
      } else {
        authUser.department = (user.department as Types.ObjectId).toString();
      }
    }

    req.authUser = authUser;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
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