import { Injectable, Logger } from "@nestjs/common";

const PAYSTACK_BASE = "https://api.paystack.co";

export type InitializeResult =
  | { ok: true; authorizationUrl: string; accessCode: string; reference: string }
  | { ok: false; error: string };

export type VerifyResult =
  | { ok: true; status: "success" | "failed" | "pending"; amount: number; paidAt?: string }
  | { ok: false; error: string };

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  get configured(): boolean {
    return this.secret.length > 0;
  }

  private async call<T>(path: string, init?: RequestInit): Promise<T | null> {
    if (!this.configured) return null;
    try {
      const res = await fetch(`${PAYSTACK_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.secret}`,
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      return (await res.json()) as T;
    } catch (err) {
      this.logger.error(`Paystack call failed: ${String(err)}`);
      return null;
    }
  }

  async initialize(input: {
    email: string;
    amountKobo: number;
    reference: string;
    callbackUrl: string;
    metadata?: Record<string, string>;
  }): Promise<InitializeResult> {
    const json = await this.call<{
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata ?? {},
      }),
    });

    if (!json) {
      return { ok: false, error: "Payment provider unavailable (is PAYSTACK_SECRET_KEY set?)" };
    }
    if (!json.status || !json.data) {
      return { ok: false, error: json.message ?? "Payment initialization failed" };
    }
    return {
      ok: true,
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    const json = await this.call<{
      status: boolean;
      message: string;
      data?: { status: string; amount: number; paid_at?: string };
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    if (!json) {
      return { ok: false, error: "Payment provider unavailable" };
    }
    if (!json.status || !json.data) {
      return { ok: false, error: json.message ?? "Verification failed" };
    }
    const raw = json.data.status;
    const status: "success" | "failed" | "pending" =
      raw === "success" ? "success" : raw === "failed" || raw === "abandoned" ? "failed" : "pending";
    return { ok: true, status, amount: json.data.amount, paidAt: json.data.paid_at };
  }
}
