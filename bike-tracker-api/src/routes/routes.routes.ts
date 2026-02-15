import type { GpsPoint } from "@bike-tracker/shared";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { routePoints, routes } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { Bindings } from "../types/env";
import { haversineDistance } from "../utils/distance";
import { errorResponse } from "../utils/errors";
import { generateId } from "../utils/id";
import { errorResponseSchema } from "../validators/auth.validator";
import {
  batchPointsResponseSchema,
  batchPointsSchema,
  createRouteResponseSchema,
  deleteRouteResponseSchema,
  listRoutesQuerySchema,
  routeListResponseSchema,
  routeWithPointsSchema,
  stopRouteResponseSchema,
  updateRouteTitleSchema,
  updateTitleResponseSchema,
} from "../validators/routes.validator";

type Env = { Bindings: Bindings; Variables: { userId: string } };

const bearerSecurity = [{ Bearer: [] }];

const app = new OpenAPIHono<Env>();

// 全ルートに認証必須
app.use("/*", authMiddleware);

// ── ルート記録開始 ──────────────
const createRouteRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Routes"],
  summary: "記録開始",
  security: bearerSecurity,
  responses: {
    201: {
      description: "記録開始",
      content: { "application/json": { schema: createRouteResponseSchema } },
    },
    401: {
      description: "認証エラー",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(createRouteRoute, async (c) => {
  const userId = c.get("userId");
  const db = drizzle(c.env.DB);
  const id = generateId();

  await db.insert(routes).values({ id, userId, startedAt: new Date().toISOString() });
  return c.json({ id, status: "recording" }, 201);
});

// ── 履歴一覧 ────────────────────
const listRoutesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Routes"],
  summary: "履歴一覧",
  security: bearerSecurity,
  request: { query: listRoutesQuerySchema },
  responses: {
    200: {
      description: "ルート一覧",
      content: { "application/json": { schema: routeListResponseSchema } },
    },
  },
});

app.openapi(listRoutesRoute, async (c) => {
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

  return c.json({ data, nextCursor }, 200);
});

// ── ルート詳細 ──────────────────
const getRouteRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Routes"],
  summary: "ルート詳細（ポイント含む）",
  security: bearerSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "ルート詳細",
      content: { "application/json": { schema: routeWithPointsSchema } },
    },
    404: {
      description: "未検出",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(getRouteRoute, async (c) => {
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

  const sanitizedPoints = points.map((p) => ({
    id: p.id,
    routeId: p.routeId,
    latitude: p.latitude,
    longitude: p.longitude,
    recordedAt: p.recordedAt,
    ...(p.altitude !== null && { altitude: p.altitude }),
    ...(p.speed !== null && { speed: p.speed }),
    ...(p.heading !== null && { heading: p.heading }),
    ...(p.accuracy !== null && { accuracy: p.accuracy }),
  }));

  return c.json({ ...route, points: sanitizedPoints }, 200);
});

// ── 記録停止 ────────────────────
const stopRouteRoute = createRoute({
  method: "patch",
  path: "/{id}/stop",
  tags: ["Routes"],
  summary: "記録停止（距離・速度を自動計算）",
  security: bearerSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "記録停止",
      content: { "application/json": { schema: stopRouteResponseSchema } },
    },
    404: {
      description: "未検出",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(stopRouteRoute, async (c) => {
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

  let totalDistance = 0;
  let maxSpeed = 0;

  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude,
    );
    const speed = points[i].speed ?? 0;
    if (speed > maxSpeed) {
      maxSpeed = speed;
    }
  }

  const endedAt = new Date().toISOString();
  const startTime = new Date(route.startedAt).getTime();
  const endTime = new Date(endedAt).getTime();
  const durationS = Math.round((endTime - startTime) / 1000);
  const avgSpeedKmh = durationS > 0 ? totalDistance / 1000 / (durationS / 3600) : 0;

  await db
    .update(routes)
    .set({
      status: "completed",
      endedAt,
      distanceM: Math.round(totalDistance),
      durationS,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      maxSpeedKmh: Math.round(maxSpeed * 3.6 * 10) / 10,
    })
    .where(eq(routes.id, routeId));

  return c.json(
    {
      id: routeId,
      status: "completed",
      distanceM: Math.round(totalDistance),
      durationS,
    },
    200,
  );
});

// ── タイトル編集 ────────────────
const updateTitleRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Routes"],
  summary: "タイトル編集",
  security: bearerSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateRouteTitleSchema } } },
  },
  responses: {
    200: {
      description: "更新成功",
      content: { "application/json": { schema: updateTitleResponseSchema } },
    },
    404: {
      description: "未検出",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(updateTitleRoute, async (c) => {
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
  return c.json({ id: routeId, title }, 200);
});

// ── ルート削除 ──────────────────
const deleteRouteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Routes"],
  summary: "ルート削除",
  security: bearerSecurity,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "削除成功",
      content: { "application/json": { schema: deleteRouteResponseSchema } },
    },
    404: {
      description: "未検出",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(deleteRouteRoute, async (c) => {
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
  return c.json({ deleted: true }, 200);
});

// ── GPSポイントバッチ送信 ───────
const batchPointsRoute = createRoute({
  method: "post",
  path: "/{id}/points",
  tags: ["Routes"],
  summary: "GPSポイントバッチ送信",
  description: "accuracy > 50m のポイントは自動除外。100件ずつバッチinsert。",
  security: bearerSecurity,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: batchPointsSchema } } },
  },
  responses: {
    200: {
      description: "送信成功",
      content: { "application/json": { schema: batchPointsResponseSchema } },
    },
    400: {
      description: "バリデーションエラー",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "未検出",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(batchPointsRoute, async (c) => {
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

  const filtered = (points as GpsPoint[]).filter((p) => !p.accuracy || p.accuracy <= 50);

  if (filtered.length > 0) {
    const values = filtered.map((p: GpsPoint) => ({
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

    const BATCH_SIZE = 100;
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      await db.insert(routePoints).values(values.slice(i, i + BATCH_SIZE));
    }
  }

  return c.json({ received: points.length, stored: filtered.length }, 200);
});

export default app;
