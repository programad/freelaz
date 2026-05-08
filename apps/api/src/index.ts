import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { professionData, stateData } from "@freelaz/shared";
import locationRoutes from "./routes/location";

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

const EXCHANGE_RATE_CACHE_KEY = "exchange-rate:usd-brl";
const EXCHANGE_RATE_TTL_SECONDS = 600;
const FALLBACK_EXCHANGE_RATE = 5.57;

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

const calculationEventSchema = z.object({
  profession: z.string().min(1).max(50),
  state: z.string().min(1).max(10),
  experienceLevel: z.enum(["junior", "pleno", "senior", "specialist"]),
  monthlyExpenses: z.number().nonnegative().max(1_000_000),
  hourlyRateBRL: z.number().nonnegative().max(10_000),
  hourlyRateUSD: z.number().nonnegative().max(10_000),
  clientCountry: z.string().max(80).optional(),
  clientCity: z.string().max(80).optional(),
  exchangeRate: z.number().positive().max(100).optional(),
});

app.post(
  "/api/analytics/calculation",
  zValidator("json", calculationEventSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "Invalid payload", issues: result.error.issues },
        400
      );
    }
  }),
  (c) => {
    const event = c.req.valid("json");
    console.log("Analytics calculation event:", event);
    // TODO: persist to D1 once the binding is configured
    return c.json({ success: true });
  }
);

// Mount location routes
app.route("/", locationRoutes);

export default app;
