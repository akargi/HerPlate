import { Module } from "@nestjs/common";
import { DonationsController } from "./donations.controller";
import { PaystackService } from "./paystack.service";
import { AuthGuard } from "../auth/auth.guard";
import { MailModule } from "../mail/mail.module";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule, MailModule],
  controllers: [DonationsController],
  providers: [PaystackService, AuthGuard],
})
export class DonationsModule {}
