import { Schema, model, Types, Document } from "mongoose";

export interface IDeptRoleAssignment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  department: Types.ObjectId;
  role: Types.ObjectId;             // -> DeptRole
  startAt?: Date | null;
  endAt?: Date | null;
  isActive: boolean;
  createdBy: Types.ObjectId;
}

const DeptRoleAssignmentSchema = new Schema<IDeptRoleAssignment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    role: { type: Schema.Types.ObjectId, ref: "DeptRole", required: true, index: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

// If you want to allow multiple different roles per user in a dept, keep this:
// Unique on (user, department, role)
DeptRoleAssignmentSchema.index(
  { user: 1, department: 1, role: 1 },
  { unique: true }
);

// If you want to enforce ONE primary role per department per user, add:
// DeptRoleAssignmentSchema.index({ user: 1, department: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default model<IDeptRoleAssignment>("DeptRoleAssignment", DeptRoleAssignmentSchema);
