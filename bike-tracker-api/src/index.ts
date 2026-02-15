import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth.routes";
import routesRoutes from "./routes/routes.routes";
import type { Bindings } from "./types/env";

const app = new Hono<{ Bindings: Bindings }>();

// ── ミドルウェア ────────────────
app.use("*", cors());
app.use("*", logger());

// ── ヘルスチェック ──────────────
app.get("/health", (c) => c.json({ status: "ok" }));

// ── ルート登録 ──────────────────
app.route("/auth", authRoutes);
app.route("/routes", routesRoutes);

// ── グローバルエラーハンドラ ────
app.onError((err, c) => {
  console.error(err);
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "サーバー内部エラーが発生しました" } },
    500,
  );
});

export default app;
