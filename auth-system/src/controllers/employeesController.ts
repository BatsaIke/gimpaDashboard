import { Request, Response } from "express";
import Employees, { IEmployee } from "../models/Employees";
import Department from "../models/Department";
import { hashPassword, comparePassword } from "../utils/authUtils";
import { AuthRequest } from "../types/types";
import jwt from "jsonwebtoken";

/** Create new employee (default password = 123456) */
export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, phone, role, department, rank } = req.body;

    if (!username || !role) {
      res.status(400).json({ message: "Username and role are required." });
      return;
    }

    // Validate department if provided
    if (department) {
      const dep = await Department.findById(department);
      if (!dep) {
        res.status(400).json({ message: "Invalid department provided." });
        return;
      }
    }

    // Default password
    const defaultPassword = "123456";
    const hashedPassword = await hashPassword(defaultPassword);

    const newEmployee = new Employees({
      username,
      email,
      phone,
      password: hashedPassword,
      role,
      department,
      rank,
    });

    await newEmployee.save();

    // Respond without returning the response object
    res.status(201).json({
      message: "Employee created successfully",
      user: newEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** GET all employees */
export const getAllEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await Employees.find().populate("department", "name");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** GET single employee by ID */
export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employees.findById(id).populate("department", "name");

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** Update an employee */
export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, phone, role, department, rank } = req.body;

    const employee = (await Employees.findById(id)) as IEmployee | null;
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    if (username !== undefined) employee.username = username;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (role !== undefined) employee.role = role;
    if (department !== undefined) {
      const dep = await Department.findById(department);
      if (!dep) {
        res.status(400).json({ message: "Invalid department provided." });
        return;
      }
      employee.department = department;
    }
    if (rank !== undefined) employee.rank = rank;

    await employee.save();
    res.status(200).json({
      message: "Employee updated successfully",
      user: employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** DELETE an employee */
export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedUser = await Employees.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** Reset password to "123456" */
export const resetEmployeePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employees.findById(id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const newPassword = "123456";
    employee.password = await hashPassword(newPassword);
    await employee.save();

    res.status(200).json({
      message: "Password reset successfully. New password: 123456",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/** 
 * Login employees route
 * e.g., POST /api/v1/auth/employees/login
 * They can use email or phone + password 
 */
export const employeeLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, password } = req.body;
    if (!text || !password) {
      res.status(400).json({ message: "Missing credentials" });
      return;
    }

    // Detect whether it's email or phone
    const isEmail = /\S+@\S+\.\S+/.test(text);
    let employee: IEmployee | null;
    if (isEmail) {
      employee = await Employees.findOne({ email: text }).populate("department");
    } else {
      employee = await Employees.findOne({ phone: text }).populate("department");
    }

    if (!employee) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const match = await comparePassword(password, employee.password);
    if (!match) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Create JWT with department & school
    const token = jwt.sign(
      {
        id: employee._id,
        role: employee.role,
        department: employee.department?._id, // Ensure department ID is included
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        _id: employee._id,
        username: employee.username,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department?._id, // Pass department to frontend too
      },
    });
  } catch (error) {
    console.error("Employee login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/** 
 * Change password from default or old password 
 *  - No login required 
 *  - Compares oldPassword with the database 
 *  - On success, sets new password
 *  POST /api/v1/employees/:id/change-password
 */

export const changeEmployeePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // employee's ID
    const { oldPassword, newPassword } = req.body;

    // 1) Find employee by ID
    const employee = await Employees.findById<IEmployee>(id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // 2) Check old password matches
    const isMatch = await comparePassword(oldPassword, employee.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid old password" });
      return;
    }

    // 3) Hash and set new password
    employee.password = await hashPassword(newPassword);
    await employee.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
