import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DbModule } from "./db/db.module";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { ContentModule } from "./content/content.module";
import { DonationsModule } from "./donations/donations.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: 60 },
      { name: "auth", ttl: 60_000, limit: 5 },
      { name: "forms", ttl: 60_000, limit: 10 },
    ]),
    DbModule,
    MailModule,
    AuthModule,
    SubmissionsModule,
    ContentModule,
    DonationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
