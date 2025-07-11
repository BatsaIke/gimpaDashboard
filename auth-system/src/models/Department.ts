// models/Department.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
  _id:        mongoose.Types.ObjectId;
  name:       string;
  description?: string;          // NEW
  category:   "Faculty" | "Unit"; // NEW  (default = Faculty)
  createdBy:  mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name:        { type: String, required: true, unique: true },
    description: { type: String, default: "" },                 // NEW
    category:    { type: String, enum: ["Faculty", "Unit"], default: "Faculty" }, // NEW
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>("Department", DepartmentSchema);
