import mongoose, { Schema, Document, Types } from "mongoose";

export interface IKpiHeader extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  kpis: Types.ObjectId[];
}

const KpiHeaderSchema = new Schema<IKpiHeader>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kpis: [{ type: Schema.Types.ObjectId, ref: "Kpi" }],
  },
  { timestamps: true }
);

export default mongoose.model<IKpiHeader>("KpiHeader", KpiHeaderSchema);
