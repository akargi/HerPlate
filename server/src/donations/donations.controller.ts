import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import crypto from "node:crypto";
import { DbService } from "../db/db.service";
import { MailService } from "../mail/mail.service";
import { AuthGuard } from "../auth/auth.guard";
import { PaystackService } from "./paystack.service";

class InitializeDonationDto {
  email!: string;
  name?: string;
  /** Naira amount (e.g. 25000). Converted to kobo server-side. */
  amount!: number;
  fund?: string;
  frequency?: "once" | "monthly";
}

@Controller("api/donations")
export class DonationsController {
  constructor(
    private db: DbService,
    private paystack: PaystackService,
    private mail: MailService
  ) {}

  @Post("initialize")
  async initialize(@Body() dto: InitializeDonationDto) {
    const email = (dto.email ?? "").trim();
    const amount = Number(dto.amount);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("A valid email is required");
    }
    if (!Number.isFinite(amount) || amount < 500) {
      throw new BadRequestException("Minimum donation is ₦500");
    }

    const reference = `HPTF-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const amountKobo = Math.round(amount * 100);

    const row = this.db.addDonation({
      reference,
      amount: amountKobo,
      currency: "NGN",
      fund: (dto.fund ?? "general").slice(0, 80),
      email,
      name: (dto.name ?? "").trim() || email,
      status: "pending",
      provider: "paystack",
    });

    const origin = process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
    const result = await this.paystack.initialize({
      email,
      amountKobo,
      reference,
      callbackUrl: `${origin}/get-involved/donate/thank-you?reference=${encodeURIComponent(reference)}`,
      metadata: { fund: row.fund, frequency: dto.frequency ?? "once", donorName: row.name },
    });

    if (!result.ok) {
      // Keep the pending record for reconciliation, but surface the problem.
      return { ok: false, error: result.error, reference };
    }

    return { ok: true, reference, authorizationUrl: result.authorizationUrl };
  }

  @Get("verify")
  async verify(@Query("reference") reference: string) {
    if (!reference) throw new BadRequestException("reference is required");
    const record = this.db.getDonationByReference(reference);
    if (!record) throw new BadRequestException("Unknown reference");

    const result = await this.paystack.verify(reference);
    if (!result.ok) {
      return { ok: false, error: result.error, status: record.status };
    }

    if (result.status !== record.status) {
      this.db.setDonationStatus(reference, result.status);
      if (result.status === "success") {
        void this.mail.sendDonationReceipt(
          record.email,
          record.name,
          result.amount / 100,
          reference
        );
      }
    }

    return { ok: true, status: result.status, amount: result.amount, fund: record.fund };
  }

  @UseGuards(AuthGuard)
  @Get()
  list() {
    return { donations: this.db.listDonations(), totals: this.db.donationTotals() };
  }
}
