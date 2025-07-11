// src/routes/discrepancy.js
import { Router } from "express";
import {
  listDiscrepancies,
  bookMeeting,
  resolveDiscrepancy
} from "../controllers/discrepancyController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// List all flags, or flags for a specific KPI (if kpiId param is provided)
router.get("/", verifyToken, listDiscrepancies);
router.get("/:kpiId", verifyToken, listDiscrepancies);

// Book a meeting (update existing flag)
router.put("/:id/book", verifyToken, bookMeeting);

// Resolve (delete) a flag
router.put("/:id/resolve", verifyToken, resolveDiscrepancy);

export default router;
