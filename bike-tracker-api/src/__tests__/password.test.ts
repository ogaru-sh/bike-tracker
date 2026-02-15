import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../utils/password";

describe("password utils (PBKDF2)", () => {
  it("ハッシュ化してから検証できる", async () => {
    const hash = await hashPassword("mypassword123");
    expect(hash).toContain(":");
    expect(hash.split(":")).toHaveLength(3);

    const valid = await verifyPassword("mypassword123", hash);
    expect(valid).toBe(true);
  });

  it("間違ったパスワードで検証失敗", async () => {
    const hash = await hashPassword("mypassword123");
    const valid = await verifyPassword("wrongpassword", hash);
    expect(valid).toBe(false);
  });

  it("同じパスワードでも異なるハッシュを生成する（ソルト）", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });

  it("旧形式（SHA-256単純ハッシュ）を検証できる", async () => {
    // "password123" の SHA-256 ハッシュ
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode("password123"));
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = await verifyPassword("password123", legacyHash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("wrong", legacyHash);
    expect(invalid).toBe(false);
  });
});
