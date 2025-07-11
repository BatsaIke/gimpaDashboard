import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";

const router = express.Router();

// Department Routes
router.post("/departments", verifyToken, createDepartment);    // CREATE
router.get("/departments", getAllDepartments);                 // READ all
router.get("/departments/:id", getDepartmentById);             // READ one
router.patch("/departments/:id", verifyToken, updateDepartment); // UPDATE
router.delete("/departments/:id", verifyToken, deleteDepartment); // DELETE

export default router;
