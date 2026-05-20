import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import {
  professionData,
  stateData,
  FALLBACK_EXCHANGE_RATE,
  EXCHANGE_RATE_CACHE_KEY,
  EXCHANGE_RATE_TTL_SECONDS,
} from "@freelaz/shared";
import locationRoutes from "./routes/location";
import submissionsRoutes from "./routes/submissions";

type Bindings = {
  DB: D1Database;
  LOCATION_CACHE: KVNamespace;
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
      "https://freelaz.com",
      "https://freelaz-web.pages.dev",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Freelaz API",
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

app.get("/api/exchange-rate", async (c) => {
  const kv = c.env.LOCATION_CACHE;

  if (kv) {
    const cached = await kv.get<{
      rate: number;
      lastUpdated: string;
      source: string;
    }>(EXCHANGE_RATE_CACHE_KEY, "json");
    if (cached) {
      return c.json({ ...cached, cached: true });
    }
  }

  try {
    const response = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL"
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { USDBRL?: { bid?: string } };
    const bid = data.USDBRL?.bid;
    const rate = bid ? parseFloat(bid) : NaN;
    if (!Number.isFinite(rate)) throw new Error("Invalid rate payload");

    const payload = {
      rate,
      lastUpdated: new Date().toISOString(),
      source: "awesomeapi",
    };

    if (kv) {
      await kv.put(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(payload), {
        expirationTtl: EXCHANGE_RATE_TTL_SECONDS,
      });
    }

    return c.json({ ...payload, cached: false });
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return c.json({
      rate: FALLBACK_EXCHANGE_RATE,
      lastUpdated: new Date().toISOString(),
      source: "fallback",
      cached: false,
    });
  }
});

app.route("/", locationRoutes);
app.route("/", submissionsRoutes);

export default app;
