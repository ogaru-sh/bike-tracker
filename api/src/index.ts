import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth.routes";
import routesRoutes from "./routes/routes.routes";
import type { Bindings } from "./types/env";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// ── ミドルウェア ────────────────
app.use("*", cors());
app.use("*", logger());

// ── ヘルスチェック ──────────────
app.get("/health", (c) => c.json({ status: "ok" }));

// ── ルート登録 ──────────────────
app.route("/auth", authRoutes);
app.route("/routes", routesRoutes);

// ── OpenAPI ドキュメント ────────
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "Bike Tracker API",
    version: "1.0.0",
    description: "バイク走行ルートを記録・管理するAPI",
  },
  security: [{ Bearer: [] }],
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWTトークンを入力",
});

// ── Swagger UI ──────────────────
app.get("/swagger", swaggerUI({ url: "/doc" }));

// ── グローバルエラーハンドラ ────
app.onError((err, c) => {
  console.error("[ERROR]", err.message, err.stack);
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "サーバー内部エラーが発生しました" } },
    500,
  );
});

export default app;
