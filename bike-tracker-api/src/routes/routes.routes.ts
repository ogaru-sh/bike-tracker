import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { routes, routePoints } from "../db/schema";
import {
  updateRouteTitleSchema,
  listRoutesQuerySchema,
  batchPointsSchema,
} from "../validators/routes.validator";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/id";
import { haversineDistance } from "../utils/distance";
import { errorResponse } from "../utils/errors";
import type { Bindings } from "../types/env";

type Env = { Bindings: Bindings; Variables: { userId: string } };

const app = new Hono<Env>();

// 全ルートに認証必須
app.use("/*", authMiddleware);

// ── ルート記録開始 ──────────────
app.post("/", async (c) => {
  const userId = c.get("userId");
  const db = drizzle(c.env.DB);
  const id = generateId();

  await db.insert(routes).values({
    id,
    userId,
    startedAt: new Date().toISOString(),
  });

  return c.json({ id, status: "recording" }, 201);
});

// ── 履歴一覧 ────────────────────
app.get("/", zValidator("query", listRoutesQuerySchema), async (c) => {
  const userId = c.get("userId");
  const { from, to, cursor, limit } = c.req.valid("query");
  const db = drizzle(c.env.DB);

  const conditions = [eq(routes.userId, userId)];
  if (from) conditions.push(gte(routes.startedAt, from));
  if (to) conditions.push(lte(routes.startedAt, to));
  if (cursor) conditions.push(lte(routes.startedAt, cursor));

  const results = await db
    .select()
    .from(routes)
    .where(and(...conditions))
    .orderBy(desc(routes.startedAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].startedAt : null;

  return c.json({ data, nextCursor });
});

// ── ルート詳細 ──────────────────
app.get("/:id", async (c) => {
  const userId = c.get("userId");
  const routeId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const route = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, routeId), eq(routes.userId, userId)))
    .get();

  if (!route) {
    return errorResponse(c, 404, "NOT_FOUND", "ルートが見つかりません");
  }

  const points = await db
    .select()
    .from(routePoints)
    .where(eq(routePoints.routeId, routeId))
    .orderBy(asc(routePoints.recordedAt));

  return c.json({ ...route, points });
});

// ── 記録停止 ────────────────────
app.patch("/:id/stop", async (c) => {
  const userId = c.get("userId");
  const routeId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const route = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, routeId), eq(routes.userId, userId)))
    .get();

  if (!route) {
    return errorResponse(c, 404, "NOT_FOUND", "ルートが見つかりません");
  }

  // ポイントから距離・速度を計算
  const points = await db
    .select()
    .from(routePoints)
    .where(eq(routePoints.routeId, routeId))
    .orderBy(asc(routePoints.recordedAt));

  let totalDistance = 0;
  let maxSpeed = 0;

  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
    if (points[i].speed && points[i].speed! > maxSpeed) {
      maxSpeed = points[i].speed!;
    }
  }

  const endedAt = new Date().toISOString();
  const startTime = new Date(route.startedAt).getTime();
  const endTime = new Date(endedAt).getTime();
  const durationS = Math.round((endTime - startTime) / 1000);
  const avgSpeedKmh = durationS > 0 ? (totalDistance / 1000) / (durationS / 3600) : 0;

  await db
    .update(routes)
    .set({
      status: "completed",
      endedAt,
      distanceM: Math.round(totalDistance),
      durationS,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      maxSpeedKmh: Math.round(maxSpeed * 3.6 * 10) / 10, // m/s → km/h
    })
    .where(eq(routes.id, routeId));

  return c.json({ id: routeId, status: "completed", distanceM: Math.round(totalDistance), durationS });
});

// ── タイトル編集 ────────────────
app.patch("/:id", zValidator("json", updateRouteTitleSchema), async (c) => {
  const userId = c.get("userId");
  const routeId = c.req.param("id");
  const { title } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const route = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, routeId), eq(routes.userId, userId)))
    .get();

  if (!route) {
    return errorResponse(c, 404, "NOT_FOUND", "ルートが見つかりません");
  }

  await db.update(routes).set({ title }).where(eq(routes.id, routeId));
  return c.json({ id: routeId, title });
});

// ── ルート削除 ──────────────────
app.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const routeId = c.req.param("id");
  const db = drizzle(c.env.DB);

  const route = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, routeId), eq(routes.userId, userId)))
    .get();

  if (!route) {
    return errorResponse(c, 404, "NOT_FOUND", "ルートが見つかりません");
  }

  await db.delete(routePoints).where(eq(routePoints.routeId, routeId));
  await db.delete(routes).where(eq(routes.id, routeId));
  return c.json({ deleted: true });
});

// ── GPSポイントバッチ送信 ───────
app.post("/:id/points", zValidator("json", batchPointsSchema), async (c) => {
  const userId = c.get("userId");
  const routeId = c.req.param("id");
  const { points } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const route = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, routeId), eq(routes.userId, userId)))
    .get();

  if (!route) {
    return errorResponse(c, 404, "NOT_FOUND", "ルートが見つかりません");
  }

  if (route.status !== "recording") {
    return errorResponse(c, 400, "VALIDATION_ERROR", "記録中のルートではありません");
  }

  // accuracy > 50m のノイズを除外
  const filtered = points.filter((p) => !p.accuracy || p.accuracy <= 50);

  if (filtered.length > 0) {
    const values = filtered.map((p) => ({
      id: generateId(),
      routeId,
      latitude: p.latitude,
      longitude: p.longitude,
      altitude: p.altitude,
      speed: p.speed,
      heading: p.heading,
      accuracy: p.accuracy,
      recordedAt: p.recordedAt,
    }));

    // D1 は1回のinsertで制限があるのでバッチ分割
    const BATCH_SIZE = 100;
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      await db.insert(routePoints).values(values.slice(i, i + BATCH_SIZE));
    }
  }

  return c.json({ received: points.length, stored: filtered.length });
});

export default app;
