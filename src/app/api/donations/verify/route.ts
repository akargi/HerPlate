import { NextResponse } from "next/server";

/**
 * Proxy donation verification (used by the thank-you page) to the backend.
 */
export async function GET(request: Request) {
  const apiBase = (process.env.HPTF_API_URL ?? "").replace(/\/$/, "");
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ ok: false, error: "reference is required" }, { status: 400 });
  }
  if (!apiBase) {
    return NextResponse.json(
      { ok: false, demo: true, status: "unknown", error: "Payments not configured" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `${apiBase}/api/donations/verify?reference=${encodeURIComponent(reference)}`,
      { cache: "no-store" }
    );
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; status?: string; amount?: number; fund?: string; error?: string }
      | null;
    if (!res.ok || !data) {
      return NextResponse.json(
        { ok: false, error: data?.error ?? "Verification failed" },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payment service is unreachable" },
      { status: 502 }
    );
  }
}
