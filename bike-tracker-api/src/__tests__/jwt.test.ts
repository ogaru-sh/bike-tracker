import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "../utils/jwt";

const SECRET = "test-secret-for-testing-only-32chars";

describe("JWT", () => {
  it("トークンの署名と検証", async () => {
    const token = await signToken({ sub: "user-123" }, SECRET);
    expect(token).toBeTruthy();

    const payload = await verifyToken(token, SECRET);
    expect(payload.sub).toBe("user-123");
  });

  it("不正なシークレットで検証失敗", async () => {
    const token = await signToken({ sub: "user-123" }, SECRET);
    await expect(verifyToken(token, "wrong-secret")).rejects.toThrow();
  });

  it("改ざんされたトークンで検証失敗", async () => {
    const token = await signToken({ sub: "user-123" }, SECRET);
    const tampered = `${token.slice(0, -5)}XXXXX`;
    await expect(verifyToken(tampered, SECRET)).rejects.toThrow();
  });
});
