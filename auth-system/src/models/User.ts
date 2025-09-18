// src/models/User.ts
import { model, Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES_ARRAY, SystemRole } from '../utils/rolesAccess';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName?: string;
  username?: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  role: SystemRole;

  // Membership (single)
  department?: Types.ObjectId;

  // School / misc
  school?: Types.ObjectId;
  rank?: string;

  // MIRROR: supervision (source of truth is Department.supervisors)
  isSupervisor: boolean;
  supervisedDepartments: Types.ObjectId[];

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, trim: true },
    username: { type: String, trim: true, unique: false },
    email: { type: String, lowercase: true, trim: true, unique: false },
    phone: { type: String, trim: true, unique: false },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES_ARRAY, required: true },

    // Single home department
    department: { type: Schema.Types.ObjectId, ref: 'Department' },

    school: { type: Schema.Types.ObjectId, ref: 'School' },
    rank: { type: String },

    // Mirror fields
    isSupervisor: { type: Boolean, default: false, index: true },
    supervisedDepartments: {
      type: [Schema.Types.ObjectId],
      ref: 'Department',
      default: [],
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ supervisedDepartments: 1 }); // quick lookups

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default model<IUser>('User', UserSchema);
