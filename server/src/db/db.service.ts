import { Injectable, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import crypto from "node:crypto";

export type SubmissionRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  fields: string; // JSON
  received_at: string;
  status: string;
};

export type PostRow = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  author: string;
  body: string; // JSON array
};

export type EventRow = {
  id: string;
  title: string;
  date: string;
  date_label: string;
  location: string;
  description: string;
  cta: string | null;
  cta_href: string | null;
  status: string;
};

export type DonationRow = {
  id: string;
  reference: string;
  amount: number; // kobo
  currency: string;
  fund: string;
  email: string;
  name: string;
  status: string; // pending | success | failed
  provider: string;
  created_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function id(): string {
  return crypto.randomBytes(8).toString("hex");
}

@Injectable()
export class DbService implements OnModuleInit {
  private db!: Database.Database;

  onModuleInit(): void {
    const file = process.env.DB_FILE ?? "data/hptf.db";
    const dir = file.substring(0, file.lastIndexOf("/"));
    if (dir) require("node:fs").mkdirSync(dir, { recursive: true });

    this.db = new Database(file);
    this.db.pragma("journal_mode = WAL");
    this.migrate();
    this.seed();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        fields TEXT NOT NULL DEFAULT '{}',
        received_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new'
      );
      CREATE TABLE IF NOT EXISTS posts (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        author TEXT NOT NULL,
        body TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        date_label TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        cta TEXT,
        cta_href TEXT,
        status TEXT NOT NULL DEFAULT 'upcoming'
      );
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        reference TEXT UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        fund TEXT NOT NULL DEFAULT 'general',
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        provider TEXT NOT NULL DEFAULT 'paystack',
        created_at TEXT NOT NULL
      );
    `);
  }

  /** Seed content tables once (empty-table check makes this idempotent). */
  private seed(): void {
    const postCount = this.db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number };
    if (postCount.n === 0) {
      const insert = this.db.prepare(
        "INSERT INTO posts (slug, title, date, category, excerpt, author, body) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      const seedPosts = [
        {
          slug: "first-nutrition-class-cycle",
          title: "Our first nutrition class cycle wraps up in [community]",
          date: "2026-08-20",
          category: "Program Updates",
          excerpt:
            "Eight weeks, [X] mothers, and one very loud graduation ceremony. Here is what we learned.",
          author: "HPTF Team",
          body: [
            "This is placeholder body copy. Replace with the real update: how many women completed the cycle, what the classes covered, and one or two moments that captured the community's response.",
            "Include a concrete outcome or quote from a participant, and close with what the next cycle will do differently based on what was learned.",
          ],
        },
        {
          slug: "reading-a-growth-chart",
          title: "How to read a child's growth chart (and when to worry)",
          date: "2026-07-14",
          category: "Nutrition Education",
          excerpt:
            "Growth monitoring only helps if caregivers understand it. A plain-language explainer we hand out at screenings.",
          author: "HPTF Team",
          body: [
            "This is placeholder body copy. Replace with the actual educational content: what the lines on a growth chart mean, what a crossed line signals, and the two or three actions a caregiver should take.",
            "Keep it practical and translated for the communities served — this category is where HPTF's expertise becomes visible to donors and partners.",
          ],
        },
        {
          slug: "home-garden-pilot-results",
          title: "Home garden pilot: what [X] households told us after six months",
          date: "2026-06-02",
          category: "Program Updates",
          excerpt:
            "Meals skipped, seeds saved, and the one input nobody expected to matter most.",
          author: "HPTF Team",
          body: [
            "This is placeholder body copy. Replace with the pilot's findings: participation rates, whether gardens survived the dry season, and quotes from two participating households.",
            "Close with how the findings will shape the next distribution round.",
          ],
        },
      ];
      const tx = this.db.transaction(() => {
        for (const p of seedPosts) {
          insert.run(p.slug, p.title, p.date, p.category, p.excerpt, p.author, JSON.stringify(p.body));
        }
      });
      tx();
    }

    const eventCount = this.db.prepare("SELECT COUNT(*) AS n FROM events").get() as { n: number };
    if (eventCount.n === 0) {
      const insert = this.db.prepare(
        "INSERT INTO events (id, title, date, date_label, location, description, cta, cta_href, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      const seedEvents = [
        {
          title: "Community Screening Day — [Community Name]",
          date: "2026-10-11",
          dateLabel: "11 October 2026",
          location: "[Community], Nigeria",
          description:
            "Free growth monitoring and malnutrition screening for children under five, plus nutrition counselling for caregivers.",
          cta: "Register / RSVP",
          ctaHref: "/contact",
          status: "upcoming",
        },
        {
          title: "World Food Day Outreach",
          date: "2026-10-16",
          dateLabel: "16 October 2026",
          location: "[Location], Nigeria",
          description:
            "Marking World Food Day with a community meal, cooking demonstration, and launch of the next home garden cohort.",
          cta: "Partner with us for this event",
          ctaHref: "/get-involved/partner",
          status: "upcoming",
        },
        {
          title: "Volunteer Orientation (Q4 Cohort)",
          date: "2026-09-27",
          dateLabel: "27 September 2026",
          location: "Hybrid — Kaduna + online",
          description:
            "Onboarding for new volunteers: safeguarding, community etiquette, and programme overviews.",
          cta: "Apply to volunteer",
          ctaHref: "/get-involved/volunteer",
          status: "upcoming",
        },
        {
          title: "Launch of Food Security & Zero Hunger Program",
          date: "2026-05-09",
          dateLabel: "9 May 2026",
          location: "[Community], Nigeria",
          description:
            "First distribution of home garden starter kits to 50 households, with training from our agriculture partners.",
          cta: "Read the recap",
          ctaHref: "/news",
          status: "past",
        },
      ];
      const tx = this.db.transaction(() => {
        for (const e of seedEvents) {
          insert.run(
            e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48),
            e.title,
            e.date,
            e.dateLabel,
            e.location,
            e.description,
            e.cta,
            e.ctaHref,
            e.status
          );
        }
      });
      tx();
    }
  }

  /* ------------------------------ submissions ------------------------------ */

  addSubmission(type: string, name: string, email: string, fields: Record<string, string>): SubmissionRow {
    const row: SubmissionRow = {
      id: id(),
      type,
      name,
      email,
      fields: JSON.stringify(fields),
      received_at: nowIso(),
      status: "new",
    };
    this.db
      .prepare("INSERT INTO submissions (id, type, name, email, fields, received_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(row.id, row.type, row.name, row.email, row.fields, row.received_at, row.status);
    return row;
  }

  listSubmissions(type?: string): SubmissionRow[] {
    if (type) {
      return this.db
        .prepare("SELECT * FROM submissions WHERE type = ? ORDER BY received_at DESC")
        .all(type) as SubmissionRow[];
    }
    return this.db.prepare("SELECT * FROM submissions ORDER BY received_at DESC").all() as SubmissionRow[];
  }

  setSubmissionStatus(id: string, status: string): boolean {
    const res = this.db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(status, id);
    return res.changes > 0;
  }

  deleteSubmission(id: string): boolean {
    const res = this.db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
    return res.changes > 0;
  }

  /* --------------------------------- posts --------------------------------- */

  listPosts(): PostRow[] {
    return this.db.prepare("SELECT * FROM posts ORDER BY date DESC").all() as PostRow[];
  }

  getPost(slug: string): PostRow | undefined {
    return this.db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as PostRow | undefined;
  }

  upsertPost(post: Omit<PostRow, "body"> & { body: string[] }): void {
    this.db
      .prepare(
        `INSERT INTO posts (slug, title, date, category, excerpt, author, body)
         VALUES (@slug, @title, @date, @category, @excerpt, @author, @body)
         ON CONFLICT(slug) DO UPDATE SET
           title=@title, date=@date, category=@category, excerpt=@excerpt, author=@author, body=@body`
      )
      .run({ ...post, body: JSON.stringify(post.body) });
  }

  deletePost(slug: string): boolean {
    const res = this.db.prepare("DELETE FROM posts WHERE slug = ?").run(slug);
    return res.changes > 0;
  }

  /* --------------------------------- events -------------------------------- */

  listEvents(): EventRow[] {
    return this.db.prepare("SELECT * FROM events ORDER BY date DESC").all() as EventRow[];
  }

  getEvent(id: string): EventRow | undefined {
    return this.db.prepare("SELECT * FROM events WHERE id = ?").get(id) as EventRow | undefined;
  }

  upsertEvent(event: EventRow): void {
    this.db
      .prepare(
        `INSERT INTO events (id, title, date, date_label, location, description, cta, cta_href, status)
         VALUES (@id, @title, @date, @date_label, @location, @description, @cta, @cta_href, @status)
         ON CONFLICT(id) DO UPDATE SET
           title=@title, date=@date, date_label=@date_label, location=@location,
           description=@description, cta=@cta, cta_href=@cta_href, status=@status`
      )
      .run(event);
  }

  deleteEvent(id: string): boolean {
    const res = this.db.prepare("DELETE FROM events WHERE id = ?").run(id);
    return res.changes > 0;
  }

  /* ------------------------------- donations ------------------------------- */

  addDonation(d: Omit<DonationRow, "id" | "created_at">): DonationRow {
    const row: DonationRow = { ...d, id: id(), created_at: nowIso() };
    this.db
      .prepare(
        "INSERT INTO donations (id, reference, amount, currency, fund, email, name, status, provider, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(row.id, row.reference, row.amount, row.currency, row.fund, row.email, row.name, row.status, row.provider, row.created_at);
    return row;
  }

  getDonationByReference(reference: string): DonationRow | undefined {
    return this.db.prepare("SELECT * FROM donations WHERE reference = ?").get(reference) as DonationRow | undefined;
  }

  setDonationStatus(reference: string, status: string): boolean {
    const res = this.db.prepare("UPDATE donations SET status = ? WHERE reference = ?").run(status, reference);
    return res.changes > 0;
  }

  listDonations(): DonationRow[] {
    return this.db.prepare("SELECT * FROM donations ORDER BY created_at DESC").all() as DonationRow[];
  }

  donationTotals(): { total: number; count: number } {
    const row = this.db
      .prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM donations WHERE status = 'success'")
      .get() as { total: number; count: number };
    return row;
  }
}
