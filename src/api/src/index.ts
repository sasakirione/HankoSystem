import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { registrationsRouter } from "./routes/registrations";

const app = new Hono();

// ミドルウェア
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);
app.use("*", logger());

// ルート
app.route("/api/registrations", registrationsRouter);

// ヘルスチェック
app.get("/health", (c) => c.json({ status: "ok" }));

const PORT = 8787;

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`API server running at http://localhost:${info.port}`);
});

export type AppType = typeof app;
