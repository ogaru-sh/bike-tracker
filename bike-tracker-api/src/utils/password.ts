import { argon2id, argon2Verify } from "hash-wasm";

// ── Argon2id パラメータ ─────────
// CF Workers CPU制限（50ms/リクエスト）内に収まるよう調整
// parallelism=1, memorySize=4096(4MB), iterations=3 → ~10-20ms
const ARGON2_PARAMS = {
  parallelism: 1,
  iterations: 3,
  memorySize: 4096, // 4 MB
  hashLength: 32,
};

/** パスワードをArgon2idでハッシュ化 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  return argon2id({
    password,
    salt,
    ...ARGON2_PARAMS,
    outputType: "encoded", // $argon2id$v=19$... 形式
  });
}

/** パスワードとハッシュを検証 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2Verify({ hash, password });
}

/**
 * レガシー SHA-256 ハッシュかどうかを判定
 * 移行期間中: SHA-256(64文字hex) → Argon2id に自動アップグレード
 */
export function isLegacySha256(hash: string): boolean {
  return /^[0-9a-f]{64}$/.test(hash);
}

/** レガシー SHA-256 ハッシュで検証 */
export async function verifySha256(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  const computed = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === hash;
}
