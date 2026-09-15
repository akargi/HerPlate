import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import crypto from "node:crypto";

export function makeToken(secret: string, ttlMs = 1000 * 60 * 60 * 12): string {
  const expires = Date.now() + ttlMs;
  const mac = crypto.createHmac("sha256", secret).update(String(expires)).digest("hex");
  return `${expires}:${mac}`;
}

export function verifyToken(token: string, secret: string): boolean {
  const [expires, mac] = token.split(":");
  if (!expires || !mac) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(expires).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.API_SECRET;
    if (!secret) {
      // No API secret configured → admin endpoints are open (dev mode).
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers["authorization"] ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token || !verifyToken(token, secret)) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    return true;
  }
}
