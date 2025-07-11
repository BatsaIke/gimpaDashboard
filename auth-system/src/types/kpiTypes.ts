// types/PopulatedKpi.ts
import { Types } from "mongoose";
import { IKpi } from "../models/Kpi";

export type PopulatedKpi = Omit<
  IKpi,
  "header" | "departments" | "assignedUsers" | "createdBy" | "lastUpdatedBy"
> & {
  header: {
    _id: Types.ObjectId;
    name: string;
    description?: string;
  };
  departments: {
    _id: Types.ObjectId;
    name: string;
  }[];
  assignedUsers: {
    _id: Types.ObjectId;
    username?: string;
    fullName?: string;
    email: string;
    role: string;
    employeeId?: string;
  }[];
  createdBy: {
    _id: Types.ObjectId;
    fullName?: string;
    email: string;
    role: string;
  };
  lastUpdatedBy?: {
    user: {
      _id: Types.ObjectId;
      fullName?: string;
      email: string;
      role?: string;
    };
    userType: string;
    timestamp: Date;
  };
  __v?: number;
};


export type PopulatedKpiHeader = {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdBy: {
    _id: Types.ObjectId;
    fullName?: string;
    email: string;
    role: string;
  };
  kpis: PopulatedKpi[];
  createdAt: Date;
  updatedAt: Date;
};