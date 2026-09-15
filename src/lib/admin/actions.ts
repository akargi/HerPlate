"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminConfig } from "./config";
import { createSessionToken } from "./session";
import {
  deleteEvent,
  deletePost,
  deleteSubmission,
  setSubmissionStatus,
  saveEvent,
  savePost,
  verifyAdminCredentials,
  type StoredEvent,
} from "@/lib/db";

export type ActionState = { error?: string; ok?: boolean };

/* --------------------------------- auth ---------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter your email and password." };
  }

  // When the backend API is configured, check credentials against it;
  // otherwise fall back to the local env credentials.
  const apiResult = await verifyAdminCredentials(username, password);
  const valid =
    apiResult !== null
      ? apiResult
      : username.toLowerCase() === adminConfig.username.toLowerCase() &&
        password === adminConfig.password;

  if (!valid) {
    return { error: "Incorrect email or password." };
  }

  const store = await cookies();
  store.set(adminConfig.cookieName, createSessionToken(adminConfig.username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: adminConfig.sessionMaxAge,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(adminConfig.cookieName);
  redirect("/admin/login");
}

/* ------------------------------ submissions ------------------------------ */

export async function markSubmissionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "handled") as
    | "new"
    | "handled";
  if (id) await setSubmissionStatus(id, status);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function deleteSubmissionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteSubmission(id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

/* --------------------------------- posts --------------------------------- */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function savePostAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const author = String(formData.get("author") ?? "HPTF Team").trim();
  const category = String(formData.get("category") ?? "Program Updates") as
    | "Program Updates"
    | "Community Stories"
    | "Nutrition Education"
    | "Press / Media"
    | "Events Recap";
  const date = String(formData.get("date") ?? "").trim();
  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  const body = String(formData.get("body") ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!title || !excerpt || !date || body.length === 0) {
    return { error: "Title, date, excerpt and at least one body paragraph are required." };
  }

  const slug = slugify(originalSlug || title);
  await savePost({ slug, title, date, category, excerpt, author, body });

  if (originalSlug && originalSlug !== slug) {
    await deletePost(originalSlug);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/");
  redirect("/admin/posts?saved=1");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) await deletePost(slug);
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/");
}

/* --------------------------------- events -------------------------------- */

export async function saveEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || "Kaduna, Nigeria";
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "upcoming") as
    | "upcoming"
    | "past";
  const cta = String(formData.get("cta") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim() || slugify(title);

  if (!title || !date || !description) {
    return { error: "Title, date and description are required." };
  }

  const dateObj = new Date(`${date}T00:00:00`);
  const dateLabel = isNaN(dateObj.getTime())
    ? date
    : dateObj.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const event: StoredEvent = {
    id,
    title,
    date,
    dateLabel,
    location,
    description,
    cta: cta || null,
    ctaHref: ctaHref || null,
    status,
  };
  await saveEvent(event);

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events?saved=1");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteEvent(id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
