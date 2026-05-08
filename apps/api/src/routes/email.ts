import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Bindings = {
  LOCATION_CACHE?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/api/email-signup",
  cors({
    origin: [
      "https://freelaz.com",
      "https://www.freelaz.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
    ],
    allowMethods: ["POST"],
    allowHeaders: ["Content-Type"],
  })
);

const schema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(40).optional(),
});

app.post(
  "/api/email-signup",
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid email" }, 400);
    }
  }),
  async (c) => {
    const kv = c.env.LOCATION_CACHE;
    if (!kv) return c.json({ error: "Storage not configured" }, 503);

    const { email, source } = c.req.valid("json");
    const normalized = email.trim().toLowerCase();
    const key = `email:${normalized}`;

    const existing = await kv.get(key);
    if (existing) {
      return c.json({ success: true, alreadySubscribed: true });
    }

    await kv.put(
      key,
      JSON.stringify({
        email: normalized,
        source: source ?? "unknown",
        signedUpAt: new Date().toISOString(),
      })
    );

    return c.json({ success: true });
  }
);

export default app;
