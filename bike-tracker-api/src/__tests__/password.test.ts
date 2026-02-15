import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  isLegacySha256,
  verifySha256,
} from "../utils/password";

describe("password utils (Argon2id)", () => {
  it("ハッシュ化してから検証できる", async () => {
    const hash = await hashPassword("mypassword123");
    expect(hash).toContain("$argon2id$");

    const valid = await verifyPassword(hash, "mypassword123");
    expect(valid).toBe(true);
  });

  it("間違ったパスワードで検証失敗", async () => {
    const hash = await hashPassword("mypassword123");
    const valid = await verifyPassword(hash, "wrongpassword");
    expect(valid).toBe(false);
  });

  it("同じパスワードでも異なるハッシュを生成する（ソルト）", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });

  it("レガシー SHA-256 ハッシュを判定できる", () => {
    const sha256 = "a".repeat(64);
    expect(isLegacySha256(sha256)).toBe(true);
    expect(isLegacySha256("$argon2id$v=19$m=4096,t=3,p=1$...")).toBe(false);
  });

  it("レガシー SHA-256 ハッシュを検証できる", async () => {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode("password123"));
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    expect(isLegacySha256(legacyHash)).toBe(true);

    const valid = await verifySha256("password123", legacyHash);
    expect(valid).toBe(true);

    const invalid = await verifySha256("wrong", legacyHash);
    expect(invalid).toBe(false);
  });
});
