/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";

type Score = {
  value: number;
  notes?: string;
  supportingDocuments?: string[];
  enteredBy?: mongoose.Types.ObjectId | string;
  timestamp?: Date | string;
};

type ScoreCarrier = {
  assigneeScore?: Score;
  creatorScore?: Score;
};

function toSnapshot(score: any, userId?: string | mongoose.Types.ObjectId) {
  if (score == null) return undefined;
  if (typeof score === "number") {
    return {
      value: score,
      notes: "",
      enteredBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      timestamp: new Date(),
    };
  }
  return {
    value: score.value,
    notes: score.notes ?? "",
    enteredBy:
      score.enteredBy ?? (userId ? new mongoose.Types.ObjectId(userId) : undefined),
    timestamp: score.timestamp ? new Date(score.timestamp) : new Date(),
    supportingDocuments: score.supportingDocuments ?? [],
  };
}

export async function maybeFlagDiscrepancy(
  kpiId: mongoose.Types.ObjectId,
  deliverableIndex: number,
  d: ScoreCarrier, // deliverable- or occurrence-level
  userId: string,
  assigneeId: string,
  occurrenceLabel: string | null = null
) {
  const aScore = d.assigneeScore?.value;
  const cScore = d.creatorScore?.value;
  if (aScore == null || cScore == null) return;

  const flagNeeded = aScore < 60 || cScore < 60;

  const match = {
    kpiId,
    deliverableIndex,
    assigneeId,
    occurrenceLabel: occurrenceLabel ?? null,
  };

  if (!flagNeeded) {
    await DeliverableDiscrepancy.findOneAndUpdate(
      { ...match, resolved: false },
      {
        resolved: true,
        $push: {
          history: {
            action: "auto-resolved",
            by: new mongoose.Types.ObjectId(userId),
            timestamp: new Date(),
          },
        },
      }
    );
    return;
  }

  await DeliverableDiscrepancy.findOneAndUpdate(
    match,
    {
      kpiId,
      assigneeId: new mongoose.Types.ObjectId(assigneeId),
      deliverableIndex,
      occurrenceLabel: occurrenceLabel ?? null,
      assigneeScore: toSnapshot(d.assigneeScore, d.assigneeScore?.enteredBy ?? assigneeId),
      creatorScore: toSnapshot(d.creatorScore, d.creatorScore?.enteredBy ?? userId),
      reason: `Assignee score ${aScore} / Creator score ${cScore} (flag: <60)`,
      resolved: false,
      $push: {
        history: {
          action: "created",
          by: new mongoose.Types.ObjectId(userId),
          timestamp: new Date(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
