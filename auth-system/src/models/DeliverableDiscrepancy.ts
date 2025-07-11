import mongoose, { Schema, Document } from "mongoose";

export interface IScoreSnapshot {
  value: number;
  enteredBy: mongoose.Types.ObjectId;
  notes?: string;
  supportingDocuments?: string[];
  timestamp: Date;
}

export interface IDiscrepancy extends Document {
  kpiId: mongoose.Types.ObjectId;
  deliverableIndex: number;
  assigneeId: mongoose.Types.ObjectId;

  assigneeScore: IScoreSnapshot;
  creatorScore: IScoreSnapshot;

  reason: string;
  resolutionNotes?: string;
  flaggedAt: Date;
  resolved: boolean;

  meeting?: {
    bookedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    notes?: string;
  };

  history: {
    action: string;
    timestamp: Date;
    by: mongoose.Types.ObjectId;
  }[];
}

const ScoreSnapshotSchema = new Schema<IScoreSnapshot>(
  {
    value: { type: Number, required: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    supportingDocuments: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const MeetingSchema = new Schema(
  {
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
    notes: String
  },
  { _id: false }
);

const HistorySchema = new Schema(
  {
    action: String,
    timestamp: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const DiscrepancySchema = new Schema<IDiscrepancy>({
  kpiId:           { type: mongoose.Schema.Types.ObjectId, ref: "Kpi", required: true },
  assigneeId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deliverableIndex:{ type: Number, required: true },

  assigneeScore:   { type: ScoreSnapshotSchema, required: true },
  creatorScore:    { type: ScoreSnapshotSchema, required: true },
  reason:          { type: String, required: true },
  resolutionNotes: { type: String },
  flaggedAt:       { type: Date, default: Date.now },
  resolved:        { type: Boolean, default: false },

  meeting:         MeetingSchema,
  history:         [HistorySchema]
});

// ✅ Ensure one discrepancy per assignee per deliverable per KPI
DiscrepancySchema.index(
  { kpiId: 1, deliverableIndex: 1, assigneeId: 1 },
  { unique: true }
);

export default mongoose.model<IDiscrepancy>(
  "DeliverableDiscrepancy",
  DiscrepancySchema
);
