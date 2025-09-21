import { Schema, model, Types, Document } from "mongoose";

export interface IDeptRole extends Document {
  _id: Types.ObjectId;
  department: Types.ObjectId;      // which department owns this role
  name: string;                    // e.g., "Lecturer", "Technician"
  slug: string;                    // normalized unique key per department
  description?: string;
  reportsTo?: Types.ObjectId | null; // optional parent dept role
  createdBy: Types.ObjectId;
  isActive: boolean;
  // (optional) permissions: string[]; // add later if you want fine-grained signals
}

const DeptRoleSchema = new Schema<IDeptRole>(
  {
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    reportsTo: { type: Schema.Types.ObjectId, ref: "DeptRole", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Unique per department (case-insensitive)
DeptRoleSchema.index(
  { department: 1, slug: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Basic slug helper if you want to generate in controller
export function toSlug(name: string) {
  return String(name).trim().toLowerCase().replace(/\s+/g, "-");
}

export default model<IDeptRole>("DeptRole", DeptRoleSchema);
