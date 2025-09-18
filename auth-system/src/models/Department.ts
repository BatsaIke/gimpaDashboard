// src/models/Department.ts
import mongoose, {
  Document,
  Schema,
  Types,
  HydratedDocument,
  Model,
} from "mongoose";

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  category: "Faculty" | "Unit";
  parent?: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
  supervisors: Types.ObjectId[];
  head?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
}

export interface DepartmentModel extends Model<IDepartment> {
  getSubtreeIds(this: DepartmentModel, rootId: Types.ObjectId): Promise<Types.ObjectId[]>;
  addSupervisor(this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
  removeSupervisor(this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
  setHead(this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId | null): Promise<void>;
}

const DepartmentSchema = new Schema<IDepartment, DepartmentModel>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: ["Faculty", "Unit"], default: "Faculty" },
    parent: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    ancestors: { type: [Schema.Types.ObjectId], ref: "Department", default: [] },
    supervisors: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    head: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,                 // ⬅️ removes __v automatically
    toJSON: { virtuals: true },        // no transform needed
    toObject: { virtuals: true },
  }
);

DepartmentSchema.index({ category: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
DepartmentSchema.index({ ancestors: 1 });
DepartmentSchema.index({ supervisors: 1 });
DepartmentSchema.index({ parent: 1 });

DepartmentSchema.pre("save", async function (this: HydratedDocument<IDepartment>, next) {
  try {
    if (this.parent && this.parent.equals(this._id)) {
      return next(new Error("A department cannot be its own parent."));
    }

    const parentChanged = this.isModified("parent");

    if (!this.parent) {
      this.ancestors = [];
    } else if (parentChanged || this.isNew) {
      type AncOnly = { _id: Types.ObjectId; ancestors?: Types.ObjectId[] };
      const parent = await mongoose
        .model<IDepartment>("Department")
        .findById(this.parent)
        .select("_id ancestors")
        .lean<AncOnly>()
        .exec();

      if (!parent) return next(new Error("Parent department not found."));
      if (parent.ancestors?.some(a => a.equals(this._id))) {
        return next(new Error("Invalid parent: would create a cycle in the hierarchy."));
      }
      this.ancestors = [ ...(parent.ancestors ?? []), parent._id ];
    }

    // ensure head ∈ supervisors
    if (this.head && !this.supervisors.some(s => s.equals(this.head!))) {
      this.supervisors.push(this.head);
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

/** helper: recompute user.isSupervisor from departments */
async function recomputeIsSupervisor(userId: Types.ObjectId) {
  const Department = mongoose.model<IDepartment>("Department");
  const still = await Department.exists({ supervisors: userId });
  const UserModel = mongoose.model("User");
  await UserModel.updateOne({ _id: userId }, { $set: { isSupervisor: !!still } });
}

/** === STATICS that also maintain the user mirror === */
DepartmentSchema.statics.getSubtreeIds = async function (this: DepartmentModel, rootId: Types.ObjectId) {
  const rows = await this.find({ $or: [{ _id: rootId }, { ancestors: rootId }] })
    .select("_id")
    .lean();
  return rows.map(r => r._id as Types.ObjectId);
};

DepartmentSchema.statics.addSupervisor = async function (this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId) {
  await this.updateOne({ _id: depId }, { $addToSet: { supervisors: userId } });
  const UserModel = mongoose.model("User");
  await UserModel.updateOne(
    { _id: userId },
    { $addToSet: { supervisedDepartments: depId }, $set: { isSupervisor: true } }
  );
};

DepartmentSchema.statics.removeSupervisor = async function (this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId) {
  // If the user is the current head, also clear head
  await this.updateOne({ _id: depId }, { $pull: { supervisors: userId }, $set: { head: null } });

  const UserModel = mongoose.model("User");
  await UserModel.updateOne({ _id: userId }, { $pull: { supervisedDepartments: depId } });
  await recomputeIsSupervisor(userId);
};

DepartmentSchema.statics.setHead = async function (this: DepartmentModel, depId: Types.ObjectId, userId: Types.ObjectId | null) {
  const UserModel = mongoose.model("User");

  if (userId) {
    // Set new head, ensure supervisor
    await this.updateOne(
      { _id: depId },
      { $set: { head: userId }, $addToSet: { supervisors: userId } }
    );
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { supervisedDepartments: depId }, $set: { isSupervisor: true } }
    );
  } else {
    // Clear head only
    const prev = await this.findById(depId).select("head").lean();
    await this.updateOne({ _id: depId }, { $set: { head: null } });
    if (prev?.head) await recomputeIsSupervisor(prev.head as Types.ObjectId);
  }
};

const Department = mongoose.model<IDepartment, DepartmentModel>("Department", DepartmentSchema);
export default Department;
