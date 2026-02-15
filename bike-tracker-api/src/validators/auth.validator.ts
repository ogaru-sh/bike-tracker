import { z } from "zod";

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
