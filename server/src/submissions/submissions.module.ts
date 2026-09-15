import { Module } from "@nestjs/common";
import { SubmissionsController } from "./submissions.controller";
import { AuthGuard } from "../auth/auth.guard";
import { MailModule } from "../mail/mail.module";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule, MailModule],
  controllers: [SubmissionsController],
  providers: [AuthGuard],
})
export class SubmissionsModule {}
