import { Body, Controller, Get, HttpCode, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { makeToken } from "./auth.guard";

class LoginDto {
  username!: string;
  password!: string;
}

@Controller("api/auth")
export class AuthController {
  private readonly username = process.env.ADMIN_EMAIL ?? "admin@hptf.org";
  private readonly password = process.env.ADMIN_PASSWORD ?? "hptf-admin";
  private readonly secret = process.env.API_SECRET ?? "dev-only-api-secret";

  @Get("status")
  status(): { service: string; authenticated: boolean } {
    return { service: "hptf-api", authenticated: false };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto): { token: string; expiresIn: number } {
    const ok =
      dto.username.toLowerCase() === this.username.toLowerCase() &&
      dto.password === this.password;
    if (!ok) {
      throw new UnauthorizedException("Incorrect email or password");
    }
    const ttlMs = 1000 * 60 * 60 * 12;
    return { token: makeToken(this.secret, ttlMs), expiresIn: ttlMs };
  }
}
