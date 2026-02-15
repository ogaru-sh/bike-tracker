import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { users } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { Bindings } from "../types/env";
import { errorResponse } from "../utils/errors";
import { generateId } from "../utils/id";
import { signToken } from "../utils/jwt";
import {
  hashPassword,
  verifyPassword,
  isLegacySha256,
  verifySha256,
} from "../utils/password";
import {
  appleAuthSchema,
  authResponseSchema,
  errorResponseSchema,
  loginSchema,
  signupSchema,
  tokenResponseSchema,
  userSchema,
} from "../validators/auth.validator";

type Env = { Bindings: Bindings; Variables: { userId: string } };

const app = new OpenAPIHono<Env>();

// ── サインアップ ────────────────
const signupRoute = createRoute({
  method: "post",
  path: "/signup",
  tags: ["Auth"],
  summary: "ユーザー登録",
  request: { body: { content: { "application/json": { schema: signupSchema } } } },
  responses: {
    201: {
      description: "登録成功",
      content: { "application/json": { schema: authResponseSchema } },
    },
    400: {
      description: "バリデーションエラー",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "メール重複",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(signupRoute, async (c) => {
  const { email, password, name } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return errorResponse(c, 409, "CONFLICT", "このメールアドレスは既に登録されています");
  }

  const passwordHash = await hashPassword(password);
  const id = generateId();
  await db.insert(users).values({ id, email, passwordHash, name });

  const token = await signToken({ sub: id }, c.env.JWT_SECRET);
  return c.json({ token, user: { id, email, name } }, 201);
});

// ── ログイン ────────────────────
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  summary: "ログイン",
  request: { body: { content: { "application/json": { schema: loginSchema } } } },
  responses: {
    200: {
      description: "ログイン成功",
      content: { "application/json": { schema: authResponseSchema } },
    },
    401: {
      description: "認証失敗",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !user.passwordHash) {
    return errorResponse(c, 401, "UNAUTHORIZED", "メールアドレスまたはパスワードが正しくありません");
  }

  // レガシー SHA-256 → Argon2id 自動マイグレーション
  let valid = false;
  if (isLegacySha256(user.passwordHash)) {
    valid = await verifySha256(password, user.passwordHash);
    if (valid) {
      // SHA-256 → Argon2id にアップグレード
      const newHash = await hashPassword(password);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
    }
  } else {
    valid = await verifyPassword(user.passwordHash, password);
  }

  if (!valid) {
    return errorResponse(c, 401, "UNAUTHORIZED", "メールアドレスまたはパスワードが正しくありません");
  }

  const token = await signToken({ sub: user.id }, c.env.JWT_SECRET);
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name } }, 200);
});

// ── Apple IDログイン ─────────────
const appleRoute = createRoute({
  method: "post",
  path: "/apple",
  tags: ["Auth"],
  summary: "Apple IDログイン",
  request: { body: { content: { "application/json": { schema: appleAuthSchema } } } },
  responses: {
    200: {
      description: "ログイン成功",
      content: { "application/json": { schema: authResponseSchema } },
    },
    201: {
      description: "新規登録成功",
      content: { "application/json": { schema: authResponseSchema } },
    },
    401: {
      description: "トークン検証失敗",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(appleRoute, async (c) => {
  const { idToken, name } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  let applePayload: { sub: string; email?: string };
  try {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: "https://appleid.apple.com",
      audience: c.env.APPLE_CLIENT_ID,
    });
    applePayload = payload as { sub: string; email?: string };
  } catch {
    return errorResponse(c, 401, "UNAUTHORIZED", "Apple IDトークンの検証に失敗しました");
  }

  let user = await db.select().from(users).where(eq(users.appleId, applePayload.sub)).get();
  let isNew = false;

  if (!user) {
    isNew = true;
    const id = generateId();
    await db.insert(users).values({
      id,
      appleId: applePayload.sub,
      email: applePayload.email,
      name: name || "ユーザー",
    });
    user = {
      id,
      appleId: applePayload.sub,
      email: applePayload.email ?? null,
      passwordHash: null,
      name: name || "ユーザー",
      createdAt: new Date().toISOString(),
    };
  }

  const token = await signToken({ sub: user.id }, c.env.JWT_SECRET);
  return c.json(
    { token, user: { id: user.id, email: user.email, name: user.name } },
    isNew ? 201 : 200,
  );
});

// ── トークンリフレッシュ ────────
const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["Auth"],
  summary: "トークンリフレッシュ",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "新トークン",
      content: { "application/json": { schema: tokenResponseSchema } },
    },
    401: {
      description: "認証失敗",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.openapi(refreshRoute, async (c) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return errorResponse(c, 401, "UNAUTHORIZED", "認証トークンが必要です");
  }

  try {
    const { verifyToken } = await import("../utils/jwt");
    const payload = await verifyToken(header.slice(7), c.env.JWT_SECRET);
    const token = await signToken({ sub: payload.sub }, c.env.JWT_SECRET);
    return c.json({ token }, 200);
  } catch {
    return errorResponse(c, 401, "TOKEN_EXPIRED", "トークンが無効または期限切れです");
  }
});

// ── 現在のユーザー情報取得 ──────
const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  summary: "現在のユーザー情報",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "ユーザー情報",
      content: { "application/json": { schema: userSchema } },
    },
    401: {
      description: "認証失敗",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

app.use("/me", authMiddleware);

app.openapi(meRoute, async (c) => {
  const userId = c.get("userId");
  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    return errorResponse(c, 401, "UNAUTHORIZED", "ユーザーが見つかりません");
  }

  return c.json({ id: user.id, email: user.email, name: user.name }, 200);
});

export default app;
