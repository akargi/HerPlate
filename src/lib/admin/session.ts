import crypto from "node:crypto";
import { cookies } from "next/headers";
import { adminConfig } from "./config";

function sign(payload: string, expiresAt: number): string {
  const mac = crypto
    .createHmac("sha256", adminConfig.sessionSecret)
    .update(`${payload}:${expiresAt}`)
    .digest("hex");
  return `${payload}:${expiresAt}:${mac}`;
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + adminConfig.sessionMaxAge * 1000;
  return sign(username, expiresAt);
}

export function verifySessionToken(
  token: string | undefined
): { username: string } | null {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [username, expiresAt, mac] = parts;

  const expected = crypto
    .createHmac("sha256", adminConfig.sessionSecret)
    .update(`${username}:${expiresAt}`)
    .digest("hex");

  const macBuf = Buffer.from(mac);
  const expectedBuf = Buffer.from(expected);
  if (macBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(macBuf, expectedBuf)) {
    return null;
  }
  if (Number(expiresAt) < Date.now()) return null;

  return { username };
}

/** Read the current admin session from the request cookies (server side). */
export async function getAdminSession(): Promise<{ username: string } | null> {
  const store = await cookies();
  return verifySessionToken(store.get(adminConfig.cookieName)?.value);
}
