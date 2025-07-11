import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createKpiHeader, getKpiHeaders,
    updateKpiHeader,
    deleteKpiHeader, } from "../controllers/kpiHeadersController";


const router = express.Router();

// ✅ KPI Header Routes
router.post("/", verifyToken, createKpiHeader);
router.get("/", verifyToken, getKpiHeaders);
router.patch("/:id", verifyToken, updateKpiHeader);
router.delete("/:id", verifyToken, deleteKpiHeader);

export default router;