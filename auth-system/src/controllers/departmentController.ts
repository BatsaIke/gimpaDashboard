// controllers/departmentController.ts
import { Response } from "express";
import Department from "../models/Department";
import { AuthRequest } from "../types/types";
// ^ Your extended Request interface with `authUser?: { id: string; role: string }`

/**
 * Create a new department (Rector only)   
 */
export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser || req.authUser.role !== "Rector") {
      return void res.status(403).json({ message: "Only the Rector can create departments." });
    }

    const { name, description = "", category = "Faculty" } = req.body;
    if (!name) return void res.status(400).json({ message: "Department name is required" });

    if (!["Faculty", "Unit"].includes(category))
      return void res.status(400).json({ message: "Invalid category (must be Faculty or Unit)" });

    const exists = await Department.findOne({ name });
    if (exists) return void res.status(400).json({ message: "Department already exists" });

    const newDepartment = await Department.create({
      name,
      description,
      category,
      createdBy: req.authUser.id,
    });

    res.status(201).json({ message: "Department created successfully", department: newDepartment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};


/**
 * Get all departments (any logged-in user can view, or even public if you prefer)
 */
export const getAllDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await Department.find().populate("createdBy", "fullName email");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get one department by ID
 */
export const getDepartmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate("createdBy", "fullName email");

    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }
    res.status(200).json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Update department (Rector only)
 */
export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authUser || req.authUser.role !== "Rector")
      return void res.status(403).json({ message: "Only the Rector can update departments." });

    const { id } = req.params;
    const { name, description, category } = req.body;

    const dep = await Department.findById(id);
    if (!dep) return void res.status(404).json({ message: "Department not found" });

    if (name)        dep.name        = name;
    if (description) dep.description = description;
    if (category && ["Faculty", "Unit"].includes(category)) dep.category = category;

    await dep.save();
    res.status(200).json({ message: "Department updated successfully", department: dep });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};


/**
 * Delete department (Rector only)
 */
export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Ensure only the Rector can delete departments
      if (!req.authUser || req.authUser.role !== "Rector") {
        res.status(403).json({ message: "Forbidden: Only the Rector can delete departments." });
        return;
      }
  
      const { id } = req.params;
  
      // Try to delete the department
      const deletedDepartment = await Department.findByIdAndDelete(id);
  
      if (!deletedDepartment) {
        res.status(404).json({ message: "Department not found" });
        return;
      }
  
      res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  