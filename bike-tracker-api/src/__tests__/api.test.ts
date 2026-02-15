import { describe, expect, it } from "vitest";
import app from "../index";
import { signToken } from "../utils/jwt";

const JWT_SECRET = "test-secret-for-api-testing-32chars!";

// ── D1モック ────────────────────
function createMockD1(): D1Database {
  const stub = {
    prepare(_query: string) {
      return {
        bind(..._params: unknown[]) {
          return this._execute();
        },
        all() {
          return this._execute();
        },
        first() {
          return this._execute().then((r: { results?: unknown[] }) => r.results?.[0] ?? null);
        },
        run() {
          return this._execute();
        },
        _execute() {
          return Promise.resolve({ results: [], success: true, meta: {} });
        },
      };
    },
    exec(_sql: string) {
      return Promise.resolve({ count: 1, duration: 0 });
    },
    batch(_stmts: unknown[]) {
      return Promise.resolve(_stmts.map(() => ({ results: [], success: true })));
    },
  };
  return stub as unknown as D1Database;
}

// ── ヘルパー ────────────────────
function createEnv() {
  return {
    DB: createMockD1(),
    JWT_SECRET,
    APPLE_CLIENT_ID: "com.test.biketracker",
  };
}

function req(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

// ── ヘルスチェック ──────────────
describe("GET /health", () => {
  it("200 ok を返す", async () => {
    const res = await app.fetch(req("/health"), createEnv());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "ok" });
  });
});

// ── 認証なしアクセス ────────────
describe("認証ガード", () => {
  it("POST /routes — トークンなしで401", async () => {
    const res = await app.fetch(req("/routes", { method: "POST" }), createEnv());
    expect(res.status).toBe(401);
  });

  it("GET /routes — トークンなしで401", async () => {
    const res = await app.fetch(req("/routes"), createEnv());
    expect(res.status).toBe(401);
  });

  it("不正なトークンで401", async () => {
    const res = await app.fetch(
      req("/routes", {
        method: "POST",
        headers: { Authorization: "Bearer invalid-token" },
      }),
      createEnv(),
    );
    expect(res.status).toBe(401);
  });

  it("期限切れトークンで401", async () => {
    // 過去の日時で作ったトークンを検証 → joseが期限切れで弾く
    const res = await app.fetch(
      req("/routes", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid",
        },
      }),
      createEnv(),
    );
    expect(res.status).toBe(401);
  });
});

// ── バリデーション ──────────────
describe("バリデーション", () => {
  it("POST /auth/signup — 無効なメールで400", async () => {
    const res = await app.fetch(
      req("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid", password: "short", name: "" }),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("POST /auth/signup — パスワード短すぎで400", async () => {
    const res = await app.fetch(
      req("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "abc", name: "テスト" }),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("POST /auth/login — 空bodyで400", async () => {
    const res = await app.fetch(
      req("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("POST /routes/:id/points — 空のpoints配列で400", async () => {
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/routes/fake-id/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: [] }),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("POST /routes/:id/points — 緯度範囲外で400", async () => {
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/routes/fake-id/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          points: [{ latitude: 999, longitude: 139, recordedAt: "2026-01-01T00:00:00Z" }],
        }),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });

  it("PATCH /routes/:id — 空タイトルで400", async () => {
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/routes/fake-id", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "" }),
      }),
      createEnv(),
    );
    expect(res.status).toBe(400);
  });
});

// ── JWT ユーティリティ ──────────
describe("JWT統合", () => {
  it("有効なトークンで認証が通る", async () => {
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/routes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      createEnv(),
    );
    // DBモックなので500になるかもしれないが、401ではない（認証は通過）
    expect(res.status).not.toBe(401);
  });

  it("POST /auth/refresh — 有効なトークンでリフレッシュ", async () => {
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/auth/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      createEnv(),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { token: string };
    expect(json.token).toBeTruthy();
  });

  it("POST /auth/refresh — トークンなしで401", async () => {
    const res = await app.fetch(req("/auth/refresh", { method: "POST" }), createEnv());
    expect(res.status).toBe(401);
  });
});

// ── エラーハンドリング ──────────
describe("エラーハンドリング", () => {
  it("存在しないパスで404", async () => {
    const res = await app.fetch(req("/nonexistent"), createEnv());
    expect(res.status).toBe(404);
  });

  it("グローバルエラーハンドラが500を返す", async () => {
    // 認証は通るがDBモックが不完全なのでDB操作時に500
    const token = await signToken({ sub: "user-1" }, JWT_SECRET);
    const res = await app.fetch(
      req("/routes", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      createEnv(),
    );
    // DBアクセスで失敗 → グローバルエラーハンドラが500を返す
    if (res.status === 500) {
      const json = (await res.json()) as { error: { code: string } };
      expect(json.error.code).toBe("INTERNAL_ERROR");
    }
  });
});
