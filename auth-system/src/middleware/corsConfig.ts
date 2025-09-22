// src/middleware/corsConfig.ts
import cors, { CorsOptions } from "cors";

const allowedOrigins = [
  "https://gimpa-dashboard.vercel.app",
  "https://gimpa-dashboard-git-main-batsaikes-projects.vercel.app",
  "https://gimpa-dashboard-6vdcnbce7-batsaikes-projects.vercel.app",
  "http://localhost:3000",
  "https://gimpadashboard.onrender.com"
];

// Helper to allow any *.vercel.app preview deployments
const isAllowedVercelPreview = (origin?: string) => {
  if (!origin) return false;
  
  // Allow all Vercel preview deployments for your project
  return origin.endsWith(".vercel.app") && 
         origin.includes("batsaikes-projects");
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Debug log (useful for troubleshooting)
    console.log("CORS request origin:", origin);

    // Check if origin is in allowed list or is a Vercel preview
    if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      return callback(null, true);
    }

    console.warn("CORS blocked for origin:", origin);
    return callback(new Error("CORS: origin not allowed"), false);
  },
  credentials: true, // Important when using cookies/sessions
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Auth-Token",
    "Access-Control-Allow-Credentials",
  ],
  exposedHeaders: [
    "Authorization",
    "X-Auth-Token"
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours - reduce preflight requests
};

export default cors(corsOptions);