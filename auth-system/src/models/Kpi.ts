// models/Kpi.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/* -------------------------------------------------- */
/*  Interfaces                                        */
/* -------------------------------------------------- */
export interface IScoreSubmission {
  value: number;
  enteredBy: Types.ObjectId;
  notes?: string;
  supportingDocuments?: string[];
  timestamp: Date;
}

export interface IDeliverable {
  title: string;
  action: string;
  indicator: string;
  performanceTarget: string;
  timeline: Date;
  priority: string;
  evidence: string[];
  notes?: string;
  creatorNotes?: string;
  status: "Pending" | "In Progress" | "Completed" | "Approved" | "Needs Revision";
  completionEvidence?: string[];
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;
  hasSavedAssignee?: boolean;
  hasSavedCreator?: boolean;
  _id?: Types.ObjectId;
}

export interface IKpi extends Document {
  name: string;
  description?: string;
  header: Types.ObjectId;
  departments: Types.ObjectId[];
  assignedUsers: Types.ObjectId[];
  assignedRoles: string[];
  status: "Pending" | "In Progress" | "Completed" | "Approved" | "Needs Revision";
  evidence?: string[];
  deliverables: IDeliverable[];
  createdBy: Types.ObjectId;
  lastUpdatedBy?: {
    user: Types.ObjectId;
    userType: "creator" | "assignee";
    timestamp: Date;
  };
  userSpecific?: {
    statuses: Map<string, string>;
    deliverables: Map<string, IDeliverable[]>;
  };
}

/* -------------------------------------------------- */
/*  Sub-schemas                                       */
/* -------------------------------------------------- */
const ScoreSubmissionSchema = new Schema<IScoreSubmission>(
  {
    value : { type: Number, required: true, min: 0, max: 100 },
    notes : String,
    supportingDocuments: [String],
    enteredBy : { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp : { type: Date, default: Date.now }
  },
  { _id: false }
);

const DeliverableSchema = new Schema<IDeliverable>(
  {
    title            : { type: String, required: true },
    action           : { type: String, required: true },
    indicator        : { type: String, required: true },
    performanceTarget: { type: String, required: true },
    timeline         : { type: Date,   required: true },
    priority         : { type: String, default: "Medium" },
    evidence         : [String],
    notes            : String,  // Assignee’s notes
    creatorNotes     : String,  // Creator’s review notes
    status           : {
      type: String,
      enum: ["Pending","In Progress","Completed","Approved","Needs Revision"],
      default: "Pending"
    },
    completionEvidence: [String],
    assigneeScore: { type: ScoreSubmissionSchema, default: undefined },  // ⭐️ ADD
    creatorScore : { type: ScoreSubmissionSchema, default: undefined },  // ⭐️ ADD
    hasSavedAssignee: { type: Boolean, default: false },                 // ⭐️ ADD
    hasSavedCreator : { type: Boolean, default: false },                 // ⭐️ ADD
  },
  { _id: false }
);


/* -------------------------------------------------- */
/*  Main KPI schema                                   */
/* -------------------------------------------------- */
const KpiSchema = new Schema<IKpi>(
  {
    name:        { type: String, required: true },
    description: { type: String },

    header:      { type: Schema.Types.ObjectId, ref: "KpiHeader", required: true },

    departments:   [{ type: Schema.Types.ObjectId, ref: "Department" }],
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    assignedRoles: [{ type: String }],

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved", "Needs Revision"],
      default: "Pending"
    },

    evidence:     [{ type: String }],
    deliverables: [DeliverableSchema],

    createdBy:    { type: Schema.Types.ObjectId, ref: "User", required: true },

    lastUpdatedBy: {
      user:     { type: Schema.Types.ObjectId, ref: "User" },
      userType: { type: String, enum: ["creator", "assignee"] },
      timestamp:{ type: Date }
    },

    /* ──────────── 🆕 PER-USER DATA ──────────── */
    userSpecific: {
      statuses: {
        type: Map,
        of:   String,
        default: () => new Map()
      },
      deliverables: {
        // a Map<string, IDeliverable[]>
        type: Map,
        of:   [DeliverableSchema],
        default: () => new Map()
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IKpi>("Kpi", KpiSchema);
