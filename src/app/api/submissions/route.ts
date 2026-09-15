import { NextResponse } from "next/server";
import { addSubmission, type SubmissionType } from "@/lib/db";

const validTypes: SubmissionType[] = [
  "contact",
  "volunteer",
  "partner",
  "newsletter",
  "donation",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: string;
      name?: string;
      email?: string;
      fields?: Record<string, unknown>;
    };

    const type = validTypes.includes(body.type as SubmissionType)
      ? (body.type as SubmissionType)
      : null;
    if (!type) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const email = String(body.email ?? "").trim();
    if (type !== "newsletter" && !email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const name = String(body.name ?? "").trim().slice(0, 200);
    if (!name && type !== "newsletter") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.fields ?? {})) {
      fields[key.slice(0, 60)] = String(value).slice(0, 5000);
    }

    const submission = await addSubmission({
      type,
      name: name || email,
      email,
      fields,
    });

    return NextResponse.json({ ok: true, id: submission.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
