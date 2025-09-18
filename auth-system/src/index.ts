import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";

import passport from "./utils/passportConfig";
import connectDB from "./config/db";
import sessionConfig from "./config/sessionConfig";
import corsConfig from "./middleware/corsConfig";
import loggingMiddleware from "./middleware/logging";
import errorHandler from "./middleware/errorHandler";

import routes from "./routes";
import departmentRoutes from "./routes/departmentRoutes";
import employeesRoutes from "./routes/employeesRoutes";
import kpiRoutes from "./routes/kpiRoutes";
import kpiHeaderRoutes from "./routes/kpiHeadersRoutes";
import roleRoutes from "./routes/roleRoutes";
import discrepancyRoutes from "./routes/discrepancyRoutes";
import healthRoutes from "./routes/healthroutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI || "";
const isProduction = process.env.NODE_ENV === "production";

// ---------- Core middleware ----------
app.use(express.json());
app.use(cookieParser());
app.use(corsConfig(isProduction));
app.use(loggingMiddleware(isProduction));
app.use(sessionConfig(isProduction));

// ---------- Auth ----------
app.use(passport.initialize());
app.use(passport.session());

// ---------- Static uploads ----------
app.use("/uploads", express.static("uploads"));

// ---------- API routes ----------
app.use("/api/v1/", routes);
app.use("/api/v1", departmentRoutes);
app.use("/api/v1", employeesRoutes);
app.use("/api/v1/kpis", kpiRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/kpi-headers", kpiHeaderRoutes);
app.use("/api/v1/discrepancies", discrepancyRoutes);
app.use("/api/v1", healthRoutes);

// Simple API ping (optional)
app.get(
  "/api/v1",
  (_req: Request, res: Response, _next: NextFunction) => {
    res.send("API is running");
  }
);

// ---------- Serve React client if present ----------
/**
 * UPDATED: Using process.cwd() is more reliable on Vercel than __dirname
 * as it consistently points to the project's root directory at runtime.
 */
const clientBuildPath = path.join(process.cwd(), "dashboard/build");
const indexHtml = path.join(clientBuildPath, "index.html");

if (fs.existsSync(indexHtml)) {
  console.log("✅ Serving frontend from", clientBuildPath);

  app.use(express.static(clientBuildPath));

  // Let React Router handle all other routes
  app.get("*", (_req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  console.warn("⚠️ No frontend build found at:", clientBuildPath);
}


// ---------- Error handler (after routes) ----------
app.use(errorHandler);

// ---------- Start server once DB is up ----------
let server: import("http").Server;

connectDB(DB_URI)
  .then(() => {
    server = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

// ---------- Process-level guards ----------
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});