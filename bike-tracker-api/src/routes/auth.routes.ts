import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { signupSchema, loginSchema, appleAuthSchema } from "../validators/auth.validator";
import { signToken } from "../utils/jwt";
import { generateId } from "../utils/id";
import { errorResponse } from "../utils/errors";
import type { Bindings } from "../types/env";

const app = new Hono<{ Bindings: Bindings }>();

// ── サインアップ ────────────────
app.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { email, password, name } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  // 重複チェック
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return errorResponse(c, 409, "CONFLICT", "このメールアドレスは既に登録されています");
  }

  // パスワードハッシュ（Web Crypto API）
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  const passwordHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const id = generateId();
  await db.insert(users).values({ id, email, passwordHash, name });

  const token = await signToken({ sub: id }, c.env.JWT_SECRET);
  return c.json({ token, user: { id, email, name } }, 201);
});

// ── ログイン ────────────────────
app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !user.passwordHash) {
    return errorResponse(c, 401, "UNAUTHORIZED", "メールアドレスまたはパスワードが正しくありません");
  }

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  const passwordHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (passwordHash !== user.passwordHash) {
    return errorResponse(c, 401, "UNAUTHORIZED", "メールアドレスまたはパスワードが正しくありません");
  }

  const token = await signToken({ sub: user.id }, c.env.JWT_SECRET);
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// ── Apple IDログイン ─────────────
app.post("/apple", zValidator("json", appleAuthSchema), async (c) => {
  const { idToken, name } = c.req.valid("json");
  const db = drizzle(c.env.DB);

  // Apple の idToken を検証（公開鍵取得 → JWT検証）
  let applePayload: { sub: string; email?: string };
  try {
    const jwksRes = await fetch("https://appleid.apple.com/auth/keys");
    const jwks = await jwksRes.json() as { keys: JsonWebKey[] };
    const { createRemoteJWKSet, jwtVerify } = await import("jose");

    // JWKS URL から直接検証
    const JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: "https://appleid.apple.com",
      audience: c.env.APPLE_CLIENT_ID,
    });
    applePayload = payload as { sub: string; email?: string };
  } catch {
    return errorResponse(c, 401, "UNAUTHORIZED", "Apple IDトークンの検証に失敗しました");
  }

  // 既存ユーザー検索
  let user = await db
    .select()
    .from(users)
    .where(eq(users.appleId, applePayload.sub))
    .get();

  if (!user) {
    // 新規作成
    const id = generateId();
    await db.insert(users).values({
      id,
      appleId: applePayload.sub,
      email: applePayload.email,
      name: name || "ユーザー",
    });
    user = { id, appleId: applePayload.sub, email: applePayload.email ?? null, passwordHash: null, name: name || "ユーザー", createdAt: new Date().toISOString() };
  }

  const token = await signToken({ sub: user.id }, c.env.JWT_SECRET);
  return c.json(
    { token, user: { id: user.id, email: user.email, name: user.name } },
    user.createdAt === new Date().toISOString() ? 201 : 200
  );
});

// ── トークンリフレッシュ ────────
app.post("/refresh", async (c) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return errorResponse(c, 401, "UNAUTHORIZED", "認証トークンが必要です");
  }

  try {
    const { verifyToken } = await import("../utils/jwt");
    const payload = await verifyToken(header.slice(7), c.env.JWT_SECRET);
    const token = await signToken({ sub: payload.sub }, c.env.JWT_SECRET);
    return c.json({ token });
  } catch {
    return errorResponse(c, 401, "TOKEN_EXPIRED", "トークンが無効または期限切れです");
  }
});

export default app;
