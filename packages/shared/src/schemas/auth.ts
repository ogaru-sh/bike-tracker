import { z } from "zod";

// ─── リクエスト ───
export const signupSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上必要です"),
  name: z.string().min(1, "名前は必須です").max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const appleAuthSchema = z.object({
  idToken: z.string().min(1),
  name: z.string().optional(),
});

// ─── レスポンス ───
export const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export const tokenResponseSchema = z.object({
  token: z.string(),
});

// ─── 共通エラー ───
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string().optional(), message: z.string() })).optional(),
  }),
});
