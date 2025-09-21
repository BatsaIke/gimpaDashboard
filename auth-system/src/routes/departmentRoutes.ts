// src/routes/departments.ts
import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getMyDepartments,
  getDepartmentsScoped,
  // 👇 add import
  getDepartmentsForCreateUser,
} from "../controllers/departmentController";

const router = express.Router();

// CREATE
router.post("/departments", verifyToken, createDepartment);

// READ (scoped to caller)
router.get("/departments/my", verifyToken, getMyDepartments);

// 👇 NEW: lazy list for the create-user / create-employee form
// GET /departments/create-user            → roots
// GET /departments/create-user?parent=ID  → parent + its direct children
router.get("/departments/create-user", verifyToken, getDepartmentsForCreateUser);

// READ all
router.get("/departments", getAllDepartments);

// READ one (ObjectId only)
router.get("/departments/:id([0-9a-fA-F]{24})", getDepartmentById);

// UPDATE
router.patch("/departments/:id([0-9a-fA-F]{24})", verifyToken, updateDepartment);

// DELETE
router.delete("/departments/:id([0-9a-fA-F]{24})", verifyToken, deleteDepartment);

// scoped list (yours)
router.get("/departments/scope", verifyToken, getDepartmentsScoped);


export default router;
