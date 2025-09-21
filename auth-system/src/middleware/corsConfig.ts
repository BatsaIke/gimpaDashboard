// src/middleware/corsConfig.ts
import cors from "cors";

const allowedOrigins: string[] = [
  "https://gimpa-dashboard.vercel.app",
  "http://localhost:3000",
  "https://gimpa-dashboard-6vdcnbce7-batsaikes-projects.vercel.app",
];

const corsConfig = cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
});

export default corsConfig;
