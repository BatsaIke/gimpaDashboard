import { Request, Response } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../../../types/types";
import { updateKpiStatus } from "../../../utils/kpiUtils";
import Kpi from "../../../models/Kpi";

export const changeKpiStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, promoteGlobally = true, assigneeId } = req.body;

    if (!status) {
      res.status(400).json({ message: "Missing status" });
      return;
    }

    const kpi = await Kpi.findById(id);
    const callerId = req.authUser!._id.toString();

    if (!kpi) {
      res.status(404).json({ message: "KPI not found" });
      return;
    }

    const isCreator = String(kpi.createdBy) === callerId;

    // Determine whose view we are updating (default to caller)
    const targetUserId =
      assigneeId && typeof assigneeId === "object"
        ? String(assigneeId._id)
        : String(assigneeId || callerId);

    // True global only when creator is changing AND no assigneeId was provided
    const effectivePromoteGlobally =
      isCreator && !assigneeId && promoteGlobally === true;

    updateKpiStatus(
      kpi,
      status,
      targetUserId,             // ← scope to the viewed user
      isCreator,
      effectivePromoteGlobally
    );

    // Persist meta
    kpi.markModified("status");
    kpi.lastUpdatedBy = {
      user: new mongoose.Types.ObjectId(callerId),
      userType: isCreator ? "creator" : "assignee",
      timestamp: new Date(),
    };

    await kpi.save();

    // Return the status that will actually show for this viewer
    const effectiveStatus = effectivePromoteGlobally
      ? kpi.status
      : kpi.userSpecific!.statuses.get(targetUserId) ?? kpi.status;

    res.status(200).json({
      message: "Status updated",
      status: effectiveStatus,
      scope: effectivePromoteGlobally ? "global" : "assignee",
      targetUserId
    });
  } catch (err) {
    console.error("changeKpiStatus error:", err);
    res.status(500).json({
      message: "Server error",
      error: (err as Error).message,
    });
  }
};
