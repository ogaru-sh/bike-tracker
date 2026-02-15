import { SignJWT, jwtVerify } from "jose";

const ALGORITHM = "HS256";
const EXPIRATION = "7d";

export async function signToken(
  payload: { sub: string },
  secret: string
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(key);
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<{ sub: string }> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  return payload as { sub: string };
}
