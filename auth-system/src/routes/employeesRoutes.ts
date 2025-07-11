import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { changeEmployeePassword, createEmployee, deleteEmployee, employeeLogin, getAllEmployees, getEmployeeById, resetEmployeePassword, updateEmployee } from "../controllers/employeesController";


const router = express.Router();

// Employee CRUD
router.post("/employees", verifyToken, createEmployee);
router.get("/employees", verifyToken, getAllEmployees);
router.get("/employees/:id", verifyToken, getEmployeeById);
router.patch("/employees/:id", verifyToken, updateEmployee);
router.delete("/employees/:id", verifyToken, deleteEmployee);

// Reset password to "123456"
router.post("/employees/:id/reset-password",verifyToken, resetEmployeePassword);

// ✅ New login route (Public)
router.post("/employees/login", employeeLogin);

// ✅ Change password route (Private)
router.post("/employees/:id/change-password", changeEmployeePassword);

export default router;
