import type { z } from "zod";
import type {
  signupSchema,
  loginSchema,
  appleAuthSchema,
  userSchema,
  authResponseSchema,
  tokenResponseSchema,
} from "../schemas/auth";

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type AppleAuthRequest = z.infer<typeof appleAuthSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
