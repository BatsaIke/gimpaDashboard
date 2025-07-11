import express from "express";
import { Request, Response } from "express"; // ✅ Import types for safety
import { verifyToken } from "../middleware/authMiddleware";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import {
  changeKpiStatus,
  createKpi,
  deleteKpi,
  getAllKpis,
  getUserKpis,
  updateKpi,
  uploadEvidence,
} from "../controllers/kpiController";

const router = express.Router();

// ✅ Define Upload Directory
const uploadDir = path.join(__dirname, "..", "uploads", "evidence");

// ✅ Ensure the `uploads/evidence/` folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it does not exist
}

// ✅ Define Multer Storage with folder validation
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir); // ✅ Now, the path always exists
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Initialize Multer with storage
const upload = multer({ storage });

// ✅ KPI Routes
router.get("/", verifyToken, getAllKpis);
router.post("/", verifyToken, upload.any(),createKpi );
router.patch("/:id", verifyToken, updateKpi);
router.delete("/:id", verifyToken, deleteKpi);
// Add this to your kpiRoutes.ts
router.get('/user/:userId', verifyToken, getUserKpis);
// add AFTER the ordinary PATCH /:id route
router.patch("/:id/status", verifyToken, changeKpiStatus);


// ✅ Upload KPI Evidence (PDFs/Docs)
router.post("/:id/upload", verifyToken, upload.single("file"), uploadEvidence);

export default router;
