// models/Employees.ts
import mongoose, { Document, Schema } from "mongoose";
import { ALL_ROLES_ARRAY, SystemRole } from "../utils/rolesAccess";

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  role: SystemRole;
  department?: mongoose.Types.ObjectId;
  rank?: string;
}

const EmployeesSchema = new Schema<IEmployee>({
  username: { type: String, required: true },
  email:    { type: String, unique: true, sparse: true },
  phone:    { type: String, unique: true, sparse: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ALL_ROLES_ARRAY,   // ✅ mutable string[]
    default: "Middle & Junior Staff",
    required: true
  },

  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  rank:       { type: String }
});

export default mongoose.model<IEmployee>("Employees", EmployeesSchema);
