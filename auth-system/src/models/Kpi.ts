// models/Kpi.ts
import mongoose, { Schema, Document, Types } from "mongoose";

/* -------------------------------------------------- */
/*  Interfaces (named exports)                        */
/* -------------------------------------------------- */

export interface IScoreSubmission {
  value: number;
  enteredBy: Types.ObjectId;
  notes?: string;
  supportingDocuments?: string[];
  timestamp: Date;
}

/** Global (template) deliverable — static fields only */
export interface IDeliverableTemplate {
  _id?: Types.ObjectId;
  title: string;
  action: string;
  indicator: string;
  performanceTarget: string;
  timeline?: Date;                   // required if !isRecurring
  priority: string;
  isRecurring?: boolean;
  recurrencePattern?: string;        // required if isRecurring
  promoteGlobally?: boolean;
  weight?: number;
}

/** Per-user occurrence (recurring) */
export interface IUserDeliverableOccurrence {
  occurrenceId?: string;
  periodLabel: string;
  dueDate?: Date;
  status: "Pending" | "In Progress" | "Completed" | "Approved";
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;
  evidence?: string[];
}

/** Per-user mutable deliverable state */
export interface IUserDeliverableState {
  deliverableId: Types.ObjectId; // references template _id
  status: "Pending" | "In Progress" | "Completed" | "Approved";
  assigneeScore?: IScoreSubmission;
  creatorScore?: IScoreSubmission;
  assigneeNotes?: string;
  creatorNotes?: string;
  evidence?: string[];
  occurrences?: IUserDeliverableOccurrence[];
}

export interface IKpiMethods {
  normaliseUserSpecific: () => void;
  ensureUserSpecific: (userId: string) => void;
}

export interface IKpi extends Document, IKpiMethods {
  name: string;
  description?: string;

  header: Types.ObjectId;
  departments: Types.ObjectId[];
  assignedUsers: Types.ObjectId[];
  assignedRoles: string[];

  status: "Pending" | "In Progress" | "Completed" | "Approved";

  // templates only — no files/scores here
  deliverables: IDeliverableTemplate[];

  createdBy: Types.ObjectId;
  lastUpdatedBy?: {
    user: Types.ObjectId;
    userType: "creator" | "assignee";
    timestamp: Date;
  };

  userSpecific?: {
    statuses: Map<string, string>;
    deliverables: Map<string, IUserDeliverableState[]>;
  };

  academicYear: string;
  weight: number;
}

export type KpiModel = mongoose.Model<IKpi, {}, IKpiMethods>;

/* -------------------------------------------------- */
/*  Sub-schemas                                       */
/* -------------------------------------------------- */

const ScoreSubmissionSchema = new Schema<IScoreSubmission>(
  {
    value: { type: Number, required: true, min: 0, max: 100 },
    notes: String,
    supportingDocuments: [String],
    enteredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserOccurrenceSchema = new Schema<IUserDeliverableOccurrence>(
  {
    occurrenceId: String,
    periodLabel: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved"],
      default: "Pending",
    },
    assigneeScore: { type: ScoreSubmissionSchema, default: undefined },
    creatorScore: { type: ScoreSubmissionSchema, default: undefined },
    evidence: [String],
  },
  { _id: false }
);

const DeliverableTemplateSchema = new Schema<IDeliverableTemplate>(
  {
    title: { type: String, required: true },
    action: { type: String, required: true },
    indicator: { type: String, required: true },
    performanceTarget: { type: String, required: true },
    timeline: {
      type: Date,
      required: function (this: IDeliverableTemplate) {
        return !this.isRecurring;
      },
    },
    priority: { type: String, default: "Medium" },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: {
      type: String,
      required: function (this: IDeliverableTemplate) {
        return this.isRecurring === true;
      },
    },
    promoteGlobally: { type: Boolean, default: false },
    weight: { type: Number, default: 0 },
  },
  { _id: true }
);

const UserDeliverableStateSchema = new Schema<IUserDeliverableState>(
  {
    deliverableId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved"],
      default: "Pending",
    },
    assigneeScore: { type: ScoreSubmissionSchema, default: undefined },
    creatorScore: { type: ScoreSubmissionSchema, default: undefined },
    assigneeNotes: String,
    creatorNotes: String,
    evidence: [String],
    occurrences: { type: [UserOccurrenceSchema], default: [] },
  },
  { _id: false }
);

/* -------------------------------------------------- */
/*  Main schema                                       */
/* -------------------------------------------------- */

const KpiSchema = new Schema<IKpi, KpiModel, IKpiMethods>(
  {
    name: { type: String, required: true },
    description: { type: String },
    header: { type: Schema.Types.ObjectId, ref: "KpiHeader", required: true },
    departments: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    assignedRoles: [{ type: String }],

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved"],
      default: "Pending",
    },

    deliverables: [DeliverableTemplateSchema],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastUpdatedBy: {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      userType: { type: String, enum: ["creator", "assignee"] },
      timestamp: { type: Date },
    },

    userSpecific: {
      statuses: { type: Map, of: String, default: () => new Map() },
      deliverables: { type: Map, of: [UserDeliverableStateSchema], default: () => new Map() },
    },

    academicYear: { type: String, required: true },
    weight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* -------------------------------------------------- */
/*  Hooks & methods                                   */
/* -------------------------------------------------- */

KpiSchema.pre("save", function (next) {
  if (!this.userSpecific) {
    this.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  next();
});

KpiSchema.methods.ensureUserSpecific = function (userId: string) {
  if (!this.userSpecific) {
    this.userSpecific = { statuses: new Map(), deliverables: new Map() };
  }
  if (!this.userSpecific.deliverables.has(userId)) {
    const states: IUserDeliverableState[] = (this.deliverables || []).map((tpl) => ({
      deliverableId: tpl._id as Types.ObjectId,
      status: "Pending",
      evidence: [],
      occurrences: [],
    }));
    this.userSpecific.deliverables.set(userId, states);
  }
};

KpiSchema.methods.normaliseUserSpecific = function () {
  if (!this.userSpecific) {
    this.userSpecific = { statuses: new Map(), deliverables: new Map() };
    return;
  }
  if (!(this.userSpecific.statuses instanceof Map)) {
    this.userSpecific.statuses = new Map(Object.entries(this.userSpecific.statuses as any));
  }
  if (!(this.userSpecific.deliverables instanceof Map)) {
    const m = new Map<string, IUserDeliverableState[]>();
    Object.entries(this.userSpecific.deliverables as any).forEach(([k, v]) => {
      m.set(String(k), v as IUserDeliverableState[]);
    });
    this.userSpecific.deliverables = m;
  }

  const templateIds = new Set<string>((this.deliverables || []).map((t: any) => String(t._id)));
  for (const [uid, arr] of this.userSpecific.deliverables.entries()) {
    const byId = new Map<string, IUserDeliverableState>();
    (arr || []).forEach((s) => byId.set(String(s.deliverableId), s));
    (this.deliverables || []).forEach((tpl: any) => {
      const key = String(tpl._id);
      if (!byId.has(key)) {
        byId.set(key, {
          deliverableId: tpl._id as Types.ObjectId,
          status: "Pending",
          evidence: [],
          occurrences: [],
        });
      }
    });
    const synced = Array.from(byId.values()).filter((s) => templateIds.has(String(s.deliverableId)));
    this.userSpecific.deliverables.set(uid, synced);
  }
};

/* -------------------------------------------------- */
/*  Export                                            */
/* -------------------------------------------------- */

const KpiModelExport = mongoose.model<IKpi, KpiModel>("Kpi", KpiSchema);
export default KpiModelExport;

// Back-compat alias (remove once all imports updated)
export type IDeliverable = IDeliverableTemplate;
