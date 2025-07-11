/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import DeliverableDiscrepancy from "../models/DeliverableDiscrepancy";
import { IDeliverable } from "../models/Kpi";

function toSnapshot(
  score: any,
  userId: string | mongoose.Types.ObjectId | undefined
) {
  if (score === undefined || score === null) return undefined;

  if (typeof score === "number") {
    return {
      value: score,
      notes: "",
      enteredBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      timestamp: new Date()
    };
  }
  // already object
  return {
    value: score.value,
    notes: score.notes ?? "",
    enteredBy:
      score.enteredBy ?? (userId ? new mongoose.Types.ObjectId(userId) : undefined),
    timestamp: score.timestamp ?? new Date()
  };
}

export async function maybeFlagDiscrepancy(
  kpiId: mongoose.Types.ObjectId,
  deliverableIndex: number,
  d: IDeliverable,
  userId: string,
  assigneeId: string   // ⭐️ we include assigneeId!
) {
  const aScore = d.assigneeScore?.value;
  const cScore = d.creatorScore?.value;

  if (aScore === undefined || cScore === undefined) return;

  const flagNeeded = aScore < 60 || cScore < 60;

  if (!flagNeeded) {
    await DeliverableDiscrepancy.findOneAndUpdate(
      { kpiId, deliverableIndex, assigneeId, resolved: false },
      {
        resolved: true,
        $push: {
          history: {
            action: "auto-resolved",
            by: new mongoose.Types.ObjectId(userId),
            timestamp: new Date()
          }
        }
      }
    );
    return;
  }

  // Create/update discrepancy
  await DeliverableDiscrepancy.findOneAndUpdate(
    { kpiId, deliverableIndex, assigneeId },   // ⭐️ include assigneeId
    {
      kpiId,
      assigneeId: new mongoose.Types.ObjectId(assigneeId),
      deliverableIndex,
      assigneeScore: toSnapshot(d.assigneeScore, d.assigneeScore?.enteredBy),
      creatorScore: toSnapshot(d.creatorScore, d.creatorScore?.enteredBy),
      reason: `Assignee score ${aScore} / Creator score ${cScore} (flag: <60)`,
      resolved: false,
      $push: {
        history: {
          action: "created",
          by: new mongoose.Types.ObjectId(userId),
          timestamp: new Date()
        }
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
