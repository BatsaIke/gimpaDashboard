// src/middleware/corsConfig.ts
import cors, { CorsOptions } from "cors";

const allowedOrigins = [
  "https://gimpa-dashboard.vercel.app",
  "http://localhost:3000",
  "https://gimpa-dashboard-6vdcnbce7-batsaikes-projects.vercel.app",
];

// helper to allow any *.vercel.app preview if you want that behaviour
const isAllowedVercelPreview = (origin?: string) =>
  !!origin && origin.endsWith(".vercel.app");

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // origin can be undefined for non-browser requests (curl, Postman, server-to-server)
    if (!origin) {
      // allow non-browser requests
      return callback(null, true);
    }

    // debug log (remove in production)
    console.log("CORS request origin:", origin);

    if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS: origin not allowed"), false);
  },
  credentials: true, // important when using cookies/auth
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Auth-Token",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export default cors(corsOptions);
