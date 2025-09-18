// models/DeliverableDiscrepancy.ts
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
  occurrenceLabel?: string | null;
  assigneeScore: IScoreSnapshot;
  creatorScore: IScoreSnapshot;
  resolvedScore?: IScoreSnapshot;
  previousScore?: IScoreSnapshot;
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
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { _id: false }
);

const DiscrepancySchema = new Schema<IDiscrepancy>({
  kpiId:            { type: mongoose.Schema.Types.ObjectId, ref: "Kpi", required: true, index: true },
  assigneeId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deliverableIndex: { type: Number, required: true, index: true },

  occurrenceLabel:  { type: String, default: null, index: true },

  assigneeScore:    { type: ScoreSnapshotSchema, required: true },
  creatorScore:     { type: ScoreSnapshotSchema, required: true },

  resolvedScore:    { type: ScoreSnapshotSchema },
  previousScore:    { type: ScoreSnapshotSchema },

  reason:           { type: String, required: true },
  resolutionNotes:  { type: String },
  flaggedAt:        { type: Date, default: Date.now, index: true },
  resolved:         { type: Boolean, default: false, index: true },

  meeting:          MeetingSchema,
  history:          { type: [HistorySchema], default: [] }
});

// One discrepancy per KPI + deliverable + assignee + occurrence
DiscrepancySchema.index(
  { kpiId: 1, deliverableIndex: 1, assigneeId: 1, occurrenceLabel: 1 },
  { unique: true }
);

// 🔸 Virtuals for a normalized, UI-friendly shape
DiscrepancySchema.virtual("meetingBooked").get(function (this: any) {
  if (this.meeting) return true;
  return Array.isArray(this.history) && this.history.some((h: any) => h?.action === "meeting-booked");
});

DiscrepancySchema.virtual("meetingBookedAt").get(function (this: any) {
  if (this.meeting?.timestamp) return this.meeting.timestamp;
  const h = Array.isArray(this.history)
    ? this.history.find((x: any) => x?.action === "meeting-booked")
    : null;
  return h?.timestamp ?? null;
});

DiscrepancySchema.virtual("reasonEffective").get(function (this: any) {
  return this.reason || "Score discrepancy detected";
});

DiscrepancySchema.virtual("resolutionNotesEffective").get(function (this: any) {
  return this.resolutionNotes || this.resolution || "";
});

// (Legacy read-compat) expose delIndex if some old client expects it
DiscrepancySchema.virtual("delIndex").get(function (this: any) {
  return this.deliverableIndex;
});

// Ensure virtuals appear
DiscrepancySchema.set("toJSON", { virtuals: true });
DiscrepancySchema.set("toObject", { virtuals: true });

// Safety default: ensure reason exists
DiscrepancySchema.pre("validate", function (next) {
  // @ts-ignore
  if (!this.reason) this.reason = "Score discrepancy detected";
  next();
});

export default mongoose.model<IDiscrepancy>(
  "DeliverableDiscrepancy",
  DiscrepancySchema
);
