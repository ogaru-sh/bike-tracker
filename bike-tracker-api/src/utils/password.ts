/**
 * パスワードハッシュ: PBKDF2-SHA256
 *
 * ── 採用理由 ──────────────────────────────────────────────────
 * 1. Cloudflare Workers の crypto.subtle で標準サポートされており、
 *    追加パッケージが一切不要（ゼロ依存）
 * 2. OWASP 推奨の反復回数 600,000 回を採用
 *    (https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
 * 3. ソルト（16バイトランダム）を毎回生成し、ハッシュと共に保存
 *
 * ── Argon2id を不採用とした理由 ──────────────────────────────
 * - Argon2id はメモリハード関数で GPU/ASIC 攻撃に最も強いが、
 *   Cloudflare Workers ではネイティブサポートがない
 * - WASM 実装パッケージ（argon2-wasm-edge 等）は全て小規模
 *   （⭐15以下、メンテナー1人）で、セキュリティ上重要な依存として
 *   信頼性に懸念がある
 * - PBKDF2 は GPU 攻撃への耐性が Argon2id より劣るが、
 *   600,000 回の反復 + ソルトにより一般的な攻撃には十分耐える
 * - 将来 CF Workers が Argon2id をネイティブサポートした場合、
 *   このモジュールの差し替えだけで移行可能な設計にしている
 * ──────────────────────────────────────────────────────────────
 *
 * 保存形式: "pbkdf2:600000:<base64-salt>:<base64-hash>"
 * → パラメータ内包のため、将来のイテレーション数変更にも対応可能
 */

const ALGORITHM = "PBKDF2";
const HASH_ALGORITHM = "SHA-256";
const ITERATIONS = 600_000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/** Uint8Array → Base64 文字列 */
function toBase64(buf: Uint8Array): string {
  let binary = "";
  for (const byte of buf) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** Base64 文字列 → Uint8Array */
function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }
  return buf;
}

/** PBKDF2 でキーを導出 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    ALGORITHM,
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      hash: HASH_ALGORITHM,
      salt,
      iterations,
    },
    keyMaterial,
    KEY_LENGTH * 8, // ビット単位
  );

  return new Uint8Array(derivedBits);
}

/**
 * パスワードをハッシュ化
 * @returns "pbkdf2:600000:<base64-salt>:<base64-hash>" 形式の文字列
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);

  const hash = await deriveKey(password, salt, ITERATIONS);

  return `pbkdf2:${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}

/**
 * パスワードを検証
 * @param hash - hashPassword() で生成した文字列
 * @param password - 検証するパスワード
 * @returns 一致すれば true
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }

  const iterations = Number.parseInt(parts[1], 10);
  const salt = fromBase64(parts[2]);
  const expectedHash = fromBase64(parts[3]);

  const computedHash = await deriveKey(password, salt, iterations);

  // タイミング攻撃対策: 固定時間比較
  // crypto.subtle.timingSafeEqual は CF Workers (workerd) 専用 API。
  // Node.js (vitest) では使えないため、フォールバックを用意。
  if (expectedHash.length !== computedHash.length) return false;
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(expectedHash, computedHash);
  }
  // フォールバック: 固定時間 XOR 比較
  let diff = 0;
  for (let i = 0; i < expectedHash.length; i++) {
    diff |= expectedHash[i] ^ computedHash[i];
  }
  return diff === 0;
}

// ── レガシー SHA-256 マイグレーション用 ──────────────────────
// 初期実装で使用していた単純 SHA-256 ハッシュからの移行をサポート。
// PBKDF2 ハッシュは "pbkdf2:" プレフィックスを持つため区別可能。

/** レガシー SHA-256 ハッシュかどうかを判定 */
export function isLegacySha256(hash: string): boolean {
  return !hash.startsWith("pbkdf2:") && /^[a-f0-9]{64}$/.test(hash);
}

/** レガシー SHA-256 ハッシュを検証 */
export async function verifySha256(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  const computed = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === hash;
}
