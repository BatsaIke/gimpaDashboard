// src/models/User.ts – unified model for Rector, Staff, Employees, etc.
import { model, Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES_ARRAY, SystemRole } from '../utils/rolesAccess';

/*
 *  A single document represents ANY person in the institution.
 *  ────────────────────────────────────────────────────────────
 *    • Rector, Deputy‑Rector, etc.   →  fullName
 *    • Standard employee            →  username  (+ optional fullName)
 *
 *  Password strategy:
 *    • hashed on save (bcrypt 12 rounds)
 *    • default for fresh staff can still be "123456" – ensure you hash first.
 */
export interface IUser extends Document {
   _id: Types.ObjectId;
  /** Humans might have a full name (Rector, Dean, etc.) */
  fullName?: string;
  /** Ordinary staff created by Rector might only have username */
  username?: string;

  email?: string | null;
  phone?: string | null;
  password: string;          // always hashed

  role: SystemRole;          // validated via enum
  department?: Types.ObjectId; // optional ref
  school?: Types.ObjectId;      // dean etc.
  rank?: string;                // academic rank (Professor, etc.)

  /* resets */
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  /* Mongoose helpers */
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  fullName:   { type: String, trim: true },
  username:   { type: String, trim: true, unique: false },

  email: { type: String, lowercase: true, trim: true, unique: false },
  phone: { type: String, trim: true, unique: false },

  password: { type: String, required: true, select: false },

  role:      { type: String, enum: ALL_ROLES_ARRAY, required: true },
  department:{ type: Schema.Types.ObjectId, ref: 'Department' },
  school:    { type: Schema.Types.ObjectId, ref: 'School' },
  rank:      { type: String },

  resetPasswordToken:   String,
  resetPasswordExpires: Date
}, { timestamps: true });

/* ────────── INDEXES ────────── */
// Prevent duplicate email/phone/username combos but allow nulls.
UserSchema.index({ email: 1 },   { unique: true, sparse: true });
UserSchema.index({ phone: 1 },   { unique: true, sparse: true });
UserSchema.index({ username: 1 },{ unique: true, sparse: true });

/* ────────── Hooks ────────── */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ────────── Methods ────────── */
UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default model<IUser>('User', UserSchema);
