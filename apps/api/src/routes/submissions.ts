import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  LOCATION_CACHE?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

const INDEX_KEY = "submissions:index";
const MAX_INDEX_SIZE = 1000;

const submissionSchema = z.object({
  profession: z.string().min(1).max(50),
  experienceLevel: z.enum(["junior", "pleno", "senior", "specialist"]),
  state: z.string().min(1).max(10),
  hourlyRateBRL: z.number().nonnegative().max(10_000),
  hourlyRateUSD: z.number().nonnegative().max(10_000),
  clientCountry: z.string().max(80).optional(),
  industry: z.string().max(80).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  taxRegime: z.string().max(20).optional(),
  notes: z.string().max(280).optional(),
});

export type SubmissionPayload = z.infer<typeof submissionSchema>;

interface StoredSubmission extends SubmissionPayload {
  id: string;
  submittedAt: string;
}

app.use(
  "/api/submissions",
  cors({
    origin: [
      "https://freelaz.com",
      "https://www.freelaz.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
    ],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
  })
);

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

app.post(
  "/api/submissions",
  zValidator("json", submissionSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "Invalid payload", issues: result.error.issues },
        400
      );
    }
  }),
  async (c) => {
    const kv = c.env.LOCATION_CACHE;
    if (!kv) {
      return c.json({ error: "Storage not configured" }, 503);
    }

    const data = c.req.valid("json");
    const id = generateId();
    const submittedAt = new Date().toISOString();
    const stored: StoredSubmission = { ...data, id, submittedAt };

    const itemKey = `sub:${id}`;
    await kv.put(itemKey, JSON.stringify(stored));

    const indexRaw = await kv.get(INDEX_KEY);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    index.unshift(itemKey);
    if (index.length > MAX_INDEX_SIZE) {
      index.length = MAX_INDEX_SIZE;
    }
    await kv.put(INDEX_KEY, JSON.stringify(index));

    return c.json({ success: true, id });
  }
);

app.get("/api/submissions", async (c) => {
  const kv = c.env.LOCATION_CACHE;
  if (!kv) {
    return c.json({ success: true, data: [], total: 0 });
  }

  const limit = Math.min(
    parseInt(c.req.query("limit") || "50", 10) || 50,
    200
  );

  const indexRaw = await kv.get(INDEX_KEY);
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  const slice = index.slice(0, limit);

  const items = await Promise.all(
    slice.map(async (key) => {
      const raw = await kv.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StoredSubmission;
      } catch {
        return null;
      }
    })
  );

  return c.json({
    success: true,
    data: items.filter(Boolean),
    total: index.length,
  });
});

export default app;
