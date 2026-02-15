import { z } from "zod";

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
  points: z.array(
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      altitude: z.number().optional(),
      speed: z.number().min(0).optional(),
      heading: z.number().min(0).max(360).optional(),
      accuracy: z.number().min(0).optional(),
      recordedAt: z.string(),
    })
  ).min(1).max(500),
});
