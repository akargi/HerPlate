import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private from = "HPTF <no-reply@hptf.org>";

  constructor(private config: ConfigService) {}

  onModuleInit(): void {
    const host = this.config.get<string>("SMTP_HOST");
    if (!host) {
      this.logger.warn(
        "SMTP_HOST not set — emails will be logged to the console instead of sent. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to enable real delivery."
      );
      return;
    }
    this.from = this.config.get<string>("MAIL_FROM") ?? this.from;
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>("SMTP_PORT") ?? 587),
      secure: this.config.get<string>("SMTP_SECURE") === "true",
      auth:
        this.config.get<string>("SMTP_USER") && this.config.get<string>("SMTP_PASS")
          ? {
              user: this.config.get<string>("SMTP_USER"),
              pass: this.config.get<string>("SMTP_PASS"),
            }
          : undefined,
    });
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[email:not-sent] to=${to} subject="${subject}"\n${text}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${String(err)}`);
    }
  }

  /** Notify admins about a new submission. */
  notifyNewSubmission(type: string, name: string, email: string, fields: Record<string, string>): Promise<void> {
    const adminEmail = this.config.get<string>("ADMIN_EMAIL") ?? "admin@hptf.org";
    const body = [
      `New ${type} submission from the website:`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`),
      ``,
      `— HPTF website`,
    ].join("\n");
    return this.send(adminEmail, `New ${type} inquiry: ${name}`, body);
  }

  /** Thank a submitter for reaching out. */
  thankSubmitter(type: string, name: string, email: string): Promise<void> {
    if (!email) return Promise.resolve();
    const text = [
      `Dear ${name || "friend"},`,
      ``,
      `Thank you for reaching out to Her Plate, Their Future Initiative.`,
      type === "volunteer"
        ? "We review volunteer applications monthly and will contact you about the next orientation."
        : type === "partner"
          ? "Our partnerships team will be in touch within five working days."
          : "We have received your message and will reply within five working days.",
      ``,
      `Warm regards,`,
      `Her Plate, Their Future Initiative`,
      `Nourishing Women. Nourishing Children.`,
    ].join("\n");
    return this.send(email, "Thank you for contacting HPTF", text);
  }

  /** Donation receipt. */
  sendDonationReceipt(email: string, name: string, naira: number, reference: string): Promise<void> {
    const text = [
      `Dear ${name || "friend"},`,
      ``,
      `Thank you for your generous gift of ₦${naira.toLocaleString("en-NG")} to Her Plate, Their Future Initiative.`,
      `Your reference: ${reference}`,
      ``,
      `When we nourish and empower women and girls, we create healthier children, stronger families and a better future.`,
      ``,
      `With gratitude,`,
      `Her Plate, Their Future Initiative`,
    ].join("\n");
    return this.send(email, "Thank you for your donation — HPTF", text);
  }
}
