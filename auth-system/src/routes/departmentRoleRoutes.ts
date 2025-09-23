// routes/departmentRoleRoutes.ts
import { Router } from "express";
import {

  listDeptRoles,
  updateDeptRole,
  deleteDeptRole,
  assignDeptRole,
  unassignDeptRole,
  createDeptRole,
} from "../controllers/departmentRoleController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Create & list roles in a department
router.post("/departments/:departmentId/roles",verifyToken, createDeptRole);
router.get("/departments/:departmentId/roles",verifyToken, listDeptRoles);

// Update & delete a specific role
router.put("/departments/:departmentId/roles/:roleId",verifyToken, updateDeptRole);
router.delete("/departments/:departmentId/roles/:roleId",verifyToken, deleteDeptRole);

// Assign & unassign roles
router.post("/departments/:departmentId/roles/assign",verifyToken, assignDeptRole);
router.post("/departments/:departmentId/roles/unassign",verifyToken, unassignDeptRole); 


export default router;
