// routes/healthroutes.ts
import { Router } from "express";
import os from "os";
import dns from "dns";
import { performance } from "perf_hooks";
import axios from "axios";

const router = Router();

// Test external connection (e.g., Google DNS)
const testExternalConnection = async () => {
  const start = performance.now();
  try {
    await dns.promises.resolve("google.com");
    const latency = performance.now() - start;
    return { success: true, latency };
  } catch (error) {
    return { success: false, latency: 0 };
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  const start = performance.now();
  try {
    // Assuming you're using mongoose based on your connectDB import
    const connection = require("mongoose").connection;
    const isConnected = connection.readyState === 1;
    const latency = performance.now() - start;
    return { success: isConnected, latency };
  } catch (error) {
    return { success: false, latency: 0 };
  }
};

// Test external API (optional)
const testExternalApi = async () => {
  const start = performance.now();
  try {
    await axios.get("https://httpbin.org/get", { timeout: 5000 });
    const latency = performance.now() - start;
    return { success: true, latency };
  } catch (error) {
    return { success: false, latency: 0 };
  }
};

// Network quality thresholds (in milliseconds)
const NETWORK_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 300,
  FAIR: 800,
  POOR: 1500,
};

router.get("/health", async (_req, res) => {
  try {
    const [externalConn, dbConn, apiConn] = await Promise.all([
      testExternalConnection(),
      testDatabaseConnection(),
      testExternalApi(),
    ]);

    // Determine overall status
    const allServicesUp = externalConn.success && dbConn.success;
    const maxLatency = Math.max(
      externalConn.latency,
      dbConn.latency,
      apiConn.latency
    );

    let networkQuality = "EXCELLENT";
    if (maxLatency > NETWORK_THRESHOLDS.EXCELLENT) networkQuality = "GOOD";
    if (maxLatency > NETWORK_THRESHOLDS.GOOD) networkQuality = "FAIR";
    if (maxLatency > NETWORK_THRESHOLDS.FAIR) networkQuality = "POOR";
    if (maxLatency > NETWORK_THRESHOLDS.POOR) networkQuality = "UNSTABLE";

    res.status(200).json({
      success: allServicesUp,
      message: allServicesUp ? "Backend is online!" : "Service degradation",
      services: {
        externalConnection: externalConn,
        database: dbConn,
        externalApi: apiConn,
      },
      network: {
        quality: networkQuality,
        maxLatency,
        system: {
          load: os.loadavg()[0], // 1-minute load average
          freeMemory: os.freemem(),
          totalMemory: os.totalmem(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
    success: false,
    message: "Service unavailable",
    error: (error as Error).message, // ✅ fix here
    timestamp: new Date().toISOString(),
    });
  }
});

export default router;