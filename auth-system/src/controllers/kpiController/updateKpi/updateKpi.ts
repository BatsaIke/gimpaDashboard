import mongoose from "mongoose";
import type { Response } from "express";
import { parsePatchesAndFiles } from "./parsePatches";
import { applyPatchesToKpi } from "./applyPatches";
import { buildCallerResponse } from "./buildResponse";
import { stripDynamicFromGlobal } from "./stripDynamic";
import Kpi from "../../../models/Kpi";
import { AuthRequest } from "../../../types/types";
import Discrepancy from "../../../models/DeliverableDiscrepancy"; 

import { recomputeWeights } from "../../../utils/kpiWeight";

// src/utils/mongo.ts
import { Types } from "mongoose";
import { maybeFlagDiscrepancy } from "../../../utils/discrepancyUtils";
import { checkAndFlagDiscrepancy } from "../../discrepancyController";


// Assuming toObjectId is from utils/mongo.ts and is reusable
import { toObjectId } from "../../../utils/mongo"; // Correct import path for toObjectId




// Define Score and ScoreCarrier types if not globally available, or import them.
// For this update, I'm defining them here to ensure the function compiles.
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

// Define IScoreSnapshot if not globally available or imported
interface IScoreSnapshot {
  value: number;
  enteredBy: mongoose.Types.ObjectId;
  notes?: string;
  supportingDocuments?: string[];
  timestamp: Date;
}


// ... (other imports, types like LeanKpi, DELIVERABLE_STATUSES, getDeliverableStatuses) ...

export const updateKpi = async (req: AuthRequest, res: Response): Promise<void> => {
  // Helper functions defined locally or imported if they are truly reusable across controllers
  // For this update, defining locally based on your provided snippet.

  function getAssigneeState(kpiDoc: any, userId: string, deliverableId: any) {
    const map = kpiDoc.userSpecific?.deliverables;
    const arr = map instanceof Map ? map.get(String(userId)) : map?.[String(userId)];
    if (!Array.isArray(arr)) return null;
    return (
      arr.find(
        (s: any) =>
          String(s?.deliverableId) === String(deliverableId) ||
          String(s?._id) === String(deliverableId)
      ) || null
    );
  }

  const normSnap = (snap: any, fallbackUserId: mongoose.Types.ObjectId): IScoreSnapshot | undefined => {
    if (snap == null) return undefined;
    if (typeof snap === "number") {
      return {
        value: snap,
        notes: "",
        enteredBy: fallbackUserId,
        timestamp: new Date(),
      };
    }
    return {
      value: Number(snap.value), // Ensure value is a number
      notes: snap.notes ?? "",
      enteredBy: toObjectId(String(snap.enteredBy ?? fallbackUserId)), // Ensure ObjectId
      timestamp: snap.timestamp ? new Date(snap.timestamp) : new Date(),
      supportingDocuments: Array.isArray(snap.supportingDocuments) ? snap.supportingDocuments : [],
    };
  };


  try {
    const { id } = req.params;
    const callerObjectId = toObjectId(req.authUser!._id);
    const callerIdStr = callerObjectId.toString();

    const kpi = await Kpi.findById(id);
    if (!kpi) {
      return void res.status(404).json({ message: "KPI not found" });
    }

    // Ensure userSpecific Maps are correctly initialized from lean objects
    (kpi as any).normaliseUserSpecific?.(); // Make sure normaliseUserSpecific() is available, typically from kpiResponse utils

    const isCreator = String(kpi.createdBy) === callerIdStr;

    const { patches, safeAssigneeId } = parsePatchesAndFiles(req, callerIdStr);

    const { deliverablesUpdated } = await applyPatchesToKpi({
      kpi,
      patches,
      callerId: callerIdStr,
      isCreator,
      safeAssigneeId,
    });

    /* ─────────── Creator review discrepancy logic (main + only) ─────────── */
    // Only process this logic if the current user is the KPI creator
    // and if there were actual deliverable updates that involved score changes.
    if (isCreator && deliverablesUpdated) {
        const viewerAssigneeId = safeAssigneeId ?? callerIdStr;
        const assigneeObjectId = toObjectId(viewerAssigneeId);
        const creatorObjectId = toObjectId(String(kpi.createdBy)); // Creator of the KPI is the one setting their score

        for (const p of patches as any[]) {
            const creatorTouched = p?.data?.creatorScore != null; // Did the creator's score part of the patch
            if (!creatorTouched) continue; // Only proceed if creator score was touched

            const deliverableIndex = kpi.deliverables.findIndex(
                (d) => String(d._id) === String(p.deliverableId)
            );
            if (deliverableIndex === -1) {
                console.warn(`[updateKpi] Deliverable ${p.deliverableId} not found in KPI ${kpi._id}. Skipping discrepancy check.`);
                continue;
            }

            const occurrenceLabel = p.scope === "occurrence" ? (p.occurrenceLabel ?? null) : null;
            
            // Get the current state of the deliverable/occurrence for the assignee *after* applyPatchesToKpi has run
            const state = getAssigneeState(kpi, viewerAssigneeId, p.deliverableId);
            if (!state) {
                console.warn(`[updateKpi] Assignee state for deliverable ${p.deliverableId} not found for assignee ${viewerAssigneeId}. Skipping discrepancy check.`);
                continue;
            }

            let aSnap: any, cSnap: any;
            if (occurrenceLabel) {
                const occ = Array.isArray(state.occurrences)
                    ? state.occurrences.find((o: any) => String(o?.periodLabel) === String(occurrenceLabel))
                    : null;
                aSnap = occ?.assigneeScore;
                cSnap = occ?.creatorScore;
            } else {
                aSnap = state.assigneeScore;
                cSnap = state.creatorScore;
            }

            if (!cSnap || typeof cSnap.value !== "number") {
                console.warn(`[updateKpi] Creator score (value) is invalid for deliverable ${p.deliverableId}. Skipping discrepancy check.`);
                continue;
            }

            const c = Number(cSnap.value); // Creator's score value
            const a = typeof aSnap?.value === "number" ? Number(aSnap.value) : undefined; // Assignee's score value (if exists)
            
            // Calculate the percentage difference for the gap condition
            const percentageDifference = typeof a === "number" ? ((a - c) / a) * 100 : undefined;
            
            // Define the flagging conditions:
            // 1. Creator score less than 60
            // 2. Creator score is 30% or more lower than assignee's score (if assignee has scored)
            const shouldFlag = c < 60 || (typeof percentageDifference === "number" && percentageDifference >= 30); // Changed gap to percentage difference

            const assigneeScoreSnapshot = normSnap(aSnap, assigneeObjectId);
            const creatorScoreSnapshot = normSnap(cSnap, creatorObjectId);

            if (!assigneeScoreSnapshot) {
                // We don't flag if assignee hasn't scored, as it's a review of an existing score
                continue;
            } 

            // Determine the reason for the discrepancy
            let reason = "";
            if (c < 60) {
                reason += `Creator score (${c}) is below 60.`;
            }
            if (typeof percentageDifference === "number" && percentageDifference >= 30) {
                if (reason) reason += " AND ";
                reason += `Creator score (${c}) is >= 30% lower than assignee (${a}).`;
            }


            if (shouldFlag) {
                // If a discrepancy needs to be flagged/updated
                await Discrepancy.findOneAndUpdate(
                    {
                        kpiId: toObjectId(kpi._id),
                        deliverableIndex: deliverableIndex,
                        assigneeId: assigneeObjectId,
                        occurrenceLabel: occurrenceLabel,
                        resolved: false, // Target an existing unresolved discrepancy
                    },
                    {
                        $set: { // Set all relevant fields for the discrepancy
                            assigneeScore: assigneeScoreSnapshot,
                            creatorScore: creatorScoreSnapshot,
                            reason: reason,
                            flaggedAt: new Date(),
                            resolved: false, // Ensure it's marked as unresolved
                        },
                        $push: { // Add to history
                            history: {
                                action: "flagged", // Or "updated" if it was already flagged
                                by: creatorObjectId,
                                timestamp: new Date(),
                            },
                        },
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exists, return updated doc
                );

      

            } else {
                // If conditions for flagging are NOT met, try to auto-resolve any existing open discrepancy
                const resolvedDisc = await Discrepancy.findOneAndUpdate(
                    {
                        kpiId: toObjectId(kpi._id),
                        deliverableIndex: deliverableIndex,
                        assigneeId: assigneeObjectId,
                        occurrenceLabel: occurrenceLabel,
                        resolved: false, // Only resolve if currently unresolved
                    },
                    {
                        $set: {
                            resolved: true,
                            resolutionNotes: "Automatically resolved: conditions for discrepancy no longer met.",
                            resolvedScore: creatorScoreSnapshot // Store the score that resolved it
                        },
                        $push: {
                            history: {
                                action: "auto-resolved",
                                by: creatorObjectId,
                                timestamp: new Date(),
                            },
                        },
                    },
                    { new: true } // Return the updated document
                );

                
            }
        }
    }
    /* ────────────────────────────────────────────────────────────────────── */

    // Prevent dynamic fields from being saved to the global KPI template
    const mutated = stripDynamicFromGlobal(kpi);
    if (mutated) kpi.markModified("deliverables");

    // Update who last modified the KPI (for auditing/tracking)
    kpi.lastUpdatedBy = {
      user: toObjectId(safeAssigneeId ?? callerIdStr),
      userType: isCreator ? "creator" : "assignee",
      timestamp: new Date(),
    } as any;

    // Mark userSpecific.deliverables as modified to ensure Mongoose saves changes to Maps
    kpi.markModified("userSpecific.deliverables");
    await kpi.save();

    // Recompute KPI weights if deliverables were updated, affecting overall KPI scores
    if (deliverablesUpdated) {
      await recomputeWeights(kpi.academicYear);
    }

    // Build and send the response, shaped for the caller's view
    const viewUserId = safeAssigneeId || callerIdStr;
    const payload = await buildCallerResponse(kpi, viewUserId);

    res.status(200).json({ message: "KPI updated successfully", kpi: payload });
  } catch (err: any) {
    console.error("updateKpi error:", err);
    res.status(500).json({ message: "Server error", error: err?.message || String(err) });
  }
};

