const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const ALGORITHM = "PBKDF2";
const HASH = "SHA-256";

/**
 * PBKDF2 でパスワードをハッシュ化。
 * 形式: iterations:salt(hex):hash(hex)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);

  const saltHex = toHex(salt);
  const hashHex = toHex(new Uint8Array(key));
  return `${ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * PBKDF2 ハッシュを検証。
 * 旧 SHA-256 形式（コロンなし64文字hex）にも対応。
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // 旧形式: SHA-256 単純ハッシュ (64文字hex、コロンなし)
  if (!stored.includes(":")) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
    const legacyHash = toHex(new Uint8Array(hashBuffer));
    return legacyHash === stored;
  }

  // 新形式: iterations:salt:hash
  const [iterStr, saltHex, hashHex] = stored.split(":");
  const iterations = Number.parseInt(iterStr, 10);
  const salt = fromHex(saltHex);
  const key = await deriveKey(password, salt, iterations);
  const computed = toHex(new Uint8Array(key));
  return computed === hashHex;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = ITERATIONS,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    ALGORITHM,
    false,
    ["deriveBits"],
  );

  return crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations, hash: HASH },
    keyMaterial,
    KEY_LENGTH * 8,
  );
}

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
