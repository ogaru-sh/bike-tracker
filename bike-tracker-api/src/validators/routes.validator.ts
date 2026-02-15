import { z } from "zod";

// ─── エンティティ ───
export const routeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  distanceM: z.number().nullable(),
  durationS: z.number().nullable(),
  avgSpeedKmh: z.number().nullable(),
  maxSpeedKmh: z.number().nullable(),
  status: z.string(),
  createdAt: z.string(),
});

export const gpsPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
  recordedAt: z.string(),
});

export const routePointSchema = gpsPointSchema.extend({
  id: z.string(),
  routeId: z.string(),
});

export const routeWithPointsSchema = routeSchema.extend({
  points: z.array(routePointSchema),
});

// ─── リクエスト ───
export const updateRouteTitleSchema = z.object({
  title: z.string().min(1).max(200),
});

export const listRoutesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const batchPointsSchema = z.object({
  points: z.array(gpsPointSchema).min(1).max(500),
});

// ─── レスポンス ───
export const createRouteResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export const stopRouteResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  distanceM: z.number(),
  durationS: z.number(),
});

export const updateTitleResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const deleteRouteResponseSchema = z.object({
  deleted: z.boolean(),
});

export const batchPointsResponseSchema = z.object({
  received: z.number(),
  stored: z.number(),
});

export const routeListResponseSchema = z.object({
  data: z.array(routeSchema),
  nextCursor: z.string().nullable(),
});

// ─── 型 ───
export type Route = z.infer<typeof routeSchema>;
export type RoutePoint = z.infer<typeof routePointSchema>;
export type RouteWithPoints = z.infer<typeof routeWithPointsSchema>;
export type GpsPoint = z.infer<typeof gpsPointSchema>;
export type UpdateRouteTitle = z.infer<typeof updateRouteTitleSchema>;
export type ListRoutesQuery = z.infer<typeof listRoutesQuerySchema>;
export type BatchPointsRequest = z.infer<typeof batchPointsSchema>;
export type CreateRouteResponse = z.infer<typeof createRouteResponseSchema>;
export type StopRouteResponse = z.infer<typeof stopRouteResponseSchema>;
export type UpdateTitleResponse = z.infer<typeof updateTitleResponseSchema>;
export type DeleteRouteResponse = z.infer<typeof deleteRouteResponseSchema>;
export type BatchPointsResponse = z.infer<typeof batchPointsResponseSchema>;
export type RouteListResponse = z.infer<typeof routeListResponseSchema>;
