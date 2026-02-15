import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "../validators/auth.validator";
import { batchPointsSchema, updateRouteTitleSchema } from "../validators/routes.validator";

describe("auth validators", () => {
  describe("signupSchema", () => {
    it("有効な入力", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        name: "テスト",
      });
      expect(result.success).toBe(true);
    });

    it("無効なメールアドレス", () => {
      const result = signupSchema.safeParse({
        email: "invalid",
        password: "password123",
        name: "テスト",
      });
      expect(result.success).toBe(false);
    });

    it("短すぎるパスワード", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "short",
        name: "テスト",
      });
      expect(result.success).toBe(false);
    });

    it("名前が空", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        name: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("有効な入力", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "pass",
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("routes validators", () => {
  describe("batchPointsSchema", () => {
    it("有効なポイント", () => {
      const result = batchPointsSchema.safeParse({
        points: [{ latitude: 35.68, longitude: 139.76, recordedAt: "2026-01-01T00:00:00Z" }],
      });
      expect(result.success).toBe(true);
    });

    it("空の配列は無効", () => {
      const result = batchPointsSchema.safeParse({ points: [] });
      expect(result.success).toBe(false);
    });

    it("緯度の範囲外", () => {
      const result = batchPointsSchema.safeParse({
        points: [{ latitude: 100, longitude: 139.76, recordedAt: "2026-01-01T00:00:00Z" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateRouteTitleSchema", () => {
    it("有効なタイトル", () => {
      const result = updateRouteTitleSchema.safeParse({ title: "渋谷→箱根" });
      expect(result.success).toBe(true);
    });

    it("空文字は無効", () => {
      const result = updateRouteTitleSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });
  });
});
