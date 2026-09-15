import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { posts as seedPosts } from "@/content/posts";
import { events as seedEvents } from "@/content/events";

/**
 * Data layer for the whole site.
 *
 * Primary store: the HPTF NestJS API (server/) when HPTF_API_URL is set.
 * Fallback store: the local JSON file (data/db.json) so the site keeps
 * working with zero infrastructure (dev, demos, API down).
 *
 * All admin pages, public pages, and server actions go through these
 * functions — swap the internals here without touching page code.
 *
 * NOTE: every function is async so callers are stable regardless of which
 * store is active.
 */

/* --------------------------------- types ---------------------------------- */

export type SubmissionType =
  | "contact"
  | "volunteer"
  | "partner"
  | "newsletter"
  | "donation";

export type Submission = {
  id: string;
  type: SubmissionType;
  name: string;
  email: string;
  fields: Record<string, string>;
  receivedAt: string;
  status: "new" | "handled";
};

export type StoredPost = {
  slug: string;
  title: string;
  date: string;
  category: "Program Updates" | "Community Stories" | "Nutrition Education" | "Press / Media" | "Events Recap";
  excerpt: string;
  author: string;
  body: string[];
};

export type StoredEvent = {
  id: string;
  title: string;
  date: string;
  dateLabel: string;
  location: string;
  description: string;
  cta: string | null;
  ctaHref: string | null;
  status: "upcoming" | "past";
};

/* ------------------------------ API client -------------------------------- */

const API_BASE = (process.env.HPTF_API_URL ?? "").replace(/\/$/, "");

/** Raw rows as returned by the API (snake_case, fields serialized). */
type ApiSubmissionRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  fields: Record<string, string> | string;
  received_at: string;
  status: string;
};

type ApiEventRow = {
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

/** True when the NestJS backend is configured for this deployment. */
export function isApiConfigured(): boolean {
  return API_BASE.length > 0;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Mint (and cache) an admin API token using the shared admin credentials. */
async function getApiToken(): Promise<string | null> {
  if (!API_BASE) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.ADMIN_EMAIL ?? "admin@hptf.org",
        password: process.env.ADMIN_PASSWORD ?? "hptf-admin",
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string; expiresIn?: number };
    if (!data.token) return null;
    cachedToken = {
      value: data.token,
      expiresAt: Date.now() + (data.expiresIn ?? 1000 * 60 * 60 * 12),
    };
    return cachedToken.value;
  } catch {
    return null;
  }
}

async function api<T>(
  apiPath: string,
  init?: RequestInit,
  opts?: { admin?: boolean }
): Promise<T | null> {
  if (!API_BASE) return null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (opts?.admin) {
    const token = await getApiToken();
    if (!token) return null;
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${apiPath}`, {
      ...(init ?? {}),
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function mapSubmission(row: ApiSubmissionRow): Submission {
  let fields: Record<string, string> = {};
  try {
    fields =
      typeof row.fields === "string"
        ? (JSON.parse(row.fields) as Record<string, string>)
        : (row.fields ?? {});
  } catch {
    fields = {};
  }
  return {
    id: row.id,
    type: (row.type as SubmissionType) ?? "contact",
    name: row.name,
    email: row.email,
    fields,
    receivedAt: row.received_at,
    status: row.status === "handled" ? "handled" : "new",
  };
}

function mapEvent(row: ApiEventRow): StoredEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    dateLabel: row.date_label,
    location: row.location,
    description: row.description,
    cta: row.cta,
    ctaHref: row.cta_href,
    status: row.status === "past" ? "past" : "upcoming",
  };
}

/**
 * Check admin credentials against the backend API.
 * Returns true/false from the API, or null when the API is not configured
 * (caller should fall back to local env credentials).
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return null;
  }
}

/* --------------------------- local JSON store ----------------------------- */

const dataDir = process.env.HPTF_DATA_DIR ?? path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "db.json");

// Cache across dev-server HMR reloads so the file handle / state survives.
const globalStore = globalThis as unknown as { __hptfDb?: Database };

type Database = {
  submissions: Submission[];
  posts: StoredPost[];
  events: StoredEvent[];
};

function seed(): Database {
  return {
    submissions: [],
    posts: seedPosts.map((p) => ({ ...p })),
    events: seedEvents.map((e) => ({ ...e, id: slugId(e.title) })),
  };
}

function slugId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function loadLocal(): Database {
  if (globalStore.__hptfDb) return globalStore.__hptfDb;
  try {
    if (fs.existsSync(dataFile)) {
      const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8")) as Database;
      globalStore.__hptfDb = parsed;
      return parsed;
    }
  } catch {
    // Corrupt file — fall through and reseed.
  }
  const fresh = seed();
  persistLocal(fresh);
  globalStore.__hptfDb = fresh;
  return fresh;
}

function persistLocal(db: Database): void {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmp = `${dataFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, dataFile);
}

function saveLocal(db: Database): void {
  globalStore.__hptfDb = db;
  persistLocal(db);
}

export function newId(): string {
  return crypto.randomBytes(8).toString("hex");
}

/* ------------------------------ submissions ------------------------------- */

export async function addSubmission(input: {
  type: SubmissionType;
  name: string;
  email: string;
  fields: Record<string, string>;
}): Promise<Submission> {
  const created = await api<{ ok: boolean; id: string }>("/api/submissions", {
    method: "POST",
    body: JSON.stringify({
      type: input.type,
      name: input.name,
      email: input.email,
      fields: input.fields,
    }),
  });
  if (created?.ok) {
    return {
      id: created.id,
      type: input.type,
      name: input.name,
      email: input.email,
      fields: input.fields,
      receivedAt: new Date().toISOString(),
      status: "new",
    };
  }

  const db = loadLocal();
  const submission: Submission = {
    id: newId(),
    type: input.type,
    name: input.name,
    email: input.email,
    fields: input.fields,
    receivedAt: new Date().toISOString(),
    status: "new",
  };
  db.submissions.unshift(submission);
  saveLocal(db);
  return submission;
}

export async function listSubmissions(
  type?: SubmissionType
): Promise<Submission[]> {
  const rows = await api<ApiSubmissionRow[]>(
    type ? `/api/submissions?type=${encodeURIComponent(type)}` : "/api/submissions",
    undefined,
    { admin: true }
  );
  if (rows) return rows.map(mapSubmission);
  const db = loadLocal();
  return type
    ? db.submissions.filter((s) => s.type === type)
    : db.submissions;
}

export async function setSubmissionStatus(
  id: string,
  status: Submission["status"]
): Promise<boolean> {
  const res = await api<{ ok: boolean }>(
    `/api/submissions/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    { admin: true }
  );
  if (res) return res.ok;

  const db = loadLocal();
  const s = db.submissions.find((x) => x.id === id);
  if (!s) return false;
  s.status = status;
  saveLocal(db);
  return true;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const res = await api<{ ok: boolean }>(
    `/api/submissions/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    { admin: true }
  );
  if (res) return res.ok;

  const db = loadLocal();
  const before = db.submissions.length;
  db.submissions = db.submissions.filter((x) => x.id !== id);
  const changed = db.submissions.length !== before;
  if (changed) saveLocal(db);
  return changed;
}

/* --------------------------------- posts --------------------------------- */

export async function listPosts(): Promise<StoredPost[]> {
  const rows = await api<StoredPost[]>("/api/posts");
  if (rows) return [...rows].sort((a, b) => b.date.localeCompare(a.date));
  return [...loadLocal().posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<StoredPost | undefined> {
  const row = await api<StoredPost | null>(
    `/api/posts/${encodeURIComponent(slug)}`
  );
  if (row) return row;
  return loadLocal().posts.find((p) => p.slug === slug);
}

export async function savePost(input: StoredPost): Promise<StoredPost> {
  const res = await api<{ ok: boolean }>(
    `/api/posts/${encodeURIComponent(input.slug)}`,
    { method: "PUT", body: JSON.stringify(input) },
    { admin: true }
  );
  if (res?.ok) return input;

  const db = loadLocal();
  const existing = db.posts.findIndex((p) => p.slug === input.slug);
  if (existing >= 0) {
    db.posts[existing] = input;
  } else {
    db.posts.push(input);
  }
  saveLocal(db);
  return input;
}

export async function deletePost(slug: string): Promise<boolean> {
  const res = await api<{ ok: boolean }>(
    `/api/posts/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
    { admin: true }
  );
  if (res) return res.ok;

  const db = loadLocal();
  const before = db.posts.length;
  db.posts = db.posts.filter((p) => p.slug !== slug);
  const changed = db.posts.length !== before;
  if (changed) saveLocal(db);
  return changed;
}

/* --------------------------------- events -------------------------------- */

export async function listEvents(): Promise<StoredEvent[]> {
  const rows = await api<ApiEventRow[]>("/api/events");
  if (rows) {
    return rows.map(mapEvent).sort((a, b) => b.date.localeCompare(a.date));
  }
  return [...loadLocal().events].sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveEvent(input: StoredEvent): Promise<StoredEvent> {
  const res = await api<{ ok: boolean }>(
    `/api/events/${encodeURIComponent(input.id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        id: input.id,
        title: input.title,
        date: input.date,
        location: input.location,
        description: input.description,
        status: input.status,
        cta: input.cta,
        ctaHref: input.ctaHref,
      }),
    },
    { admin: true }
  );
  if (res?.ok) return input;

  const db = loadLocal();
  const existing = db.events.findIndex((e) => e.id === input.id);
  if (existing >= 0) {
    db.events[existing] = input;
  } else {
    db.events.unshift(input);
  }
  saveLocal(db);
  return input;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await api<{ ok: boolean }>(
    `/api/events/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    { admin: true }
  );
  if (res) return res.ok;

  const db = loadLocal();
  const before = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  const changed = db.events.length !== before;
  if (changed) saveLocal(db);
  return changed;
}
