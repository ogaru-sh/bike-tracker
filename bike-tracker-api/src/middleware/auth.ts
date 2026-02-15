import { createMiddleware } from "hono/factory";
import type { Bindings } from "../types/env";
import { verifyToken } from "../utils/jwt";
import { errorResponse } from "../utils/errors";

type Env = { Bindings: Bindings; Variables: { userId: string } };

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return errorResponse(c, 401, "UNAUTHORIZED", "認証トークンが必要です");
  }

  const token = header.slice(7);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    c.set("userId", payload.sub);
    await next();
  } catch {
    return errorResponse(c, 401, "TOKEN_EXPIRED", "トークンが無効または期限切れです");
  }
});
