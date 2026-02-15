---
name: new-api
description: Hono + Zod でAPIエンドポイントを追加する手順。バリデーション、エラーハンドリング、認証ミドルウェアの適用を含む。
---

# APIエンドポイント追加ガイド

## 手順

### 1. Zod スキーマ作成

`api/src/validators/{resource}.validator.ts`

```typescript
import { z } from "zod";

export const createResourceSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
```

### 2. ルートハンドラ作成

`api/src/routes/{resource}.routes.ts`

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createResourceSchema } from "../validators/{resource}.validator";

const app = new Hono();

app.post("/", zValidator("json", createResourceSchema), async (c) => {
  const data = c.req.valid("json");
  // ... ビジネスロジック
  return c.json({ data }, 201);
});

export default app;
```

### 3. index.ts に登録

```typescript
app.route("/api/{resource}", resourceRoutes);
```

### 4. 統一エラーレスポンス

```typescript
return c.json({
  error: { code: "VALIDATION_ERROR", message: "...", details: [...] }
}, 400);
```

## チェックリスト

- [ ] Zod スキーマでリクエストバリデーション
- [ ] 認証が必要なルートは authMiddleware 適用済み
- [ ] 統一エラーレスポンス形式
- [ ] 適切なHTTPステータスコード
