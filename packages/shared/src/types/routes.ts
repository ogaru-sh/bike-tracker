import type { z } from "zod";
import type {
  routeSchema,
  routePointSchema,
  routeWithPointsSchema,
  gpsPointSchema,
  updateRouteTitleSchema,
  listRoutesQuerySchema,
  batchPointsSchema,
  createRouteResponseSchema,
  stopRouteResponseSchema,
  updateTitleResponseSchema,
  deleteRouteResponseSchema,
  batchPointsResponseSchema,
  routeListResponseSchema,
} from "../schemas/routes";

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
