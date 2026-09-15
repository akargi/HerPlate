import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { DbService } from "../db/db.service";
import { MailService } from "../mail/mail.service";
import { AuthGuard } from "../auth/auth.guard";

const VALID_TYPES = ["contact", "volunteer", "partner", "newsletter", "donation"];

class CreateSubmissionDto {
  type!: string;
  name?: string;
  email?: string;
  fields?: Record<string, string>;
}

@Controller("api/submissions")
export class SubmissionsController {
  constructor(
    private db: DbService,
    private mail: MailService
  ) {}

  @Post()
  @Throttle({ forms: { limit: 10, ttl: 60_000 } })
  async create(@Body() dto: CreateSubmissionDto) {
    if (!VALID_TYPES.includes(dto.type)) {
      throw new Error("Invalid submission type");
    }
    const email = (dto.email ?? "").trim();
    const name = (dto.name ?? "").trim();

    if (dto.type !== "newsletter") {
      if (!name) throw new Error("Name is required");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("A valid email is required");
      }
    }

    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(dto.fields ?? {})) {
      fields[k.slice(0, 60)] = String(v).slice(0, 5000);
    }

    const row = this.db.addSubmission(
      dto.type,
      name || email,
      email,
      fields
    );

    // Fire-and-forget notifications.
    void this.mail.notifyNewSubmission(dto.type, name || email, email, fields);
    void this.mail.thankSubmitter(dto.type, name, email);

    return { ok: true, id: row.id };
  }

  @UseGuards(AuthGuard)
  @Get()
  list(@Query("type") type?: string) {
    return this.db.listSubmissions(type);
  }

  @UseGuards(AuthGuard)
  @Patch(":id/status")
  setStatus(@Param("id") id: string, @Body("status") status: string) {
    if (!["new", "handled"].includes(status)) {
      throw new Error("Status must be new or handled");
    }
    return { ok: this.db.setSubmissionStatus(id, status) };
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return { ok: this.db.deleteSubmission(id) };
  }
}
