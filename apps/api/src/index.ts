import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import {
  professionData,
  stateData,
  type ProfessionKey,
  type StateKey,
} from "@brazilian-rate-calculator/shared";

type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "https://brazilian-rate-calculator.pages.dev",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Brazilian Rate Calculator API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Get profession data
app.get("/api/professions", (c) => {
  return c.json(professionData);
});

// Get state data
app.get("/api/states", (c) => {
  return c.json(stateData);
});

// Get exchange rate (mock for now, will integrate with real API later)
app.get("/api/exchange-rate", async (c) => {
  // TODO: Integrate with real exchange rate API
  return c.json({
    rate: 5.57,
    lastUpdated: new Date().toISOString(),
    source: "mock",
  });
});

// Analytics endpoint for anonymous data collection
app.post("/api/analytics/calculation", async (c) => {
  try {
    const body = await c.req.json();

    // TODO: Validate with Zod
    // TODO: Store in D1 database

    // For now, just log and return success
    console.log("Analytics data received:", body);

    return c.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return c.json({ error: "Failed to process analytics" }, 500);
  }
});

export default app;
