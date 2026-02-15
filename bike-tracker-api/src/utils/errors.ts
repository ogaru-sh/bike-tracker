import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

type ErrorDetail = {
  field?: string;
  message: string;
};

export function errorResponse(
  c: Context,
  status: ContentfulStatusCode,
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[],
) {
  return c.json({ error: { code, message, ...(details && { details }) } }, status);
}
