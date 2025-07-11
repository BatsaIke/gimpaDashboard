import mongoose from "mongoose";


const UserDeliverableSchema = new mongoose.Schema({
  kpiId: { type: mongoose.Types.ObjectId, ref: "Kpi", required: true },
  deliverableIndex: { type: Number, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["assignee", "creator"], required: true },
  score: { type: Number },
  notes: { type: String },
  status: { type: String, default: "Pending" },
}, { timestamps: true });

export default mongoose.model("UserDeliverable", UserDeliverableSchema);
