// src/routes/discrepancy.js
import { Router, Request } from "express";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";

import {
  listDiscrepancies,
  bookMeeting,
  resolveDiscrepancy,
} from "../controllers/discrepancyController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

/* ───────────────────── File-upload setup ───────────────────── */
const uploadDir = path.join(__dirname, "..", "uploads", "supporting");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file, cb) => cb(null, uploadDir),
  filename   : (_req: Request, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* ───────────────────── Routes ───────────────────── */

// List discrepancies (optionally filtered by kpiId)
router.get("/",        verifyToken, listDiscrepancies);
router.get("/:kpiId",  verifyToken, listDiscrepancies);

// Book a meeting on an existing flag
router.put("/:id/book",    verifyToken, bookMeeting);

// Resolve a flag (creator only) – accepts newScore, resolutionNotes, + optional file
router.put(
  "/:id/resolve",
  verifyToken,
  upload.single("file"),   // ⬅️  attach ONE optional file field named "file"
  resolveDiscrepancy
);

export default router;
