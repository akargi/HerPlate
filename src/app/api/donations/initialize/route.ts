import { NextResponse } from "next/server";

/**
 * Proxy the public donation-initialize call to the HPTF backend API.
 * Keeps PAYSTACK_SECRET_KEY (and the API in general) off the client.
 */
export async function POST(request: Request) {
  const apiBase = (process.env.HPTF_API_URL ?? "").replace(/\/$/, "");
  if (!apiBase) {
    return NextResponse.json(
      {
        ok: false,
        demo: true,
        error:
          "Online payments are not configured yet — this is a demonstration submission.",
      },
      { status: 200 }
    );
  }

  try {
    const body = await request.text();
    const res = await fetch(`${apiBase}/api/donations/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; authorizationUrl?: string; reference?: string }
      | null;

    if (!res.ok || !data) {
      return NextResponse.json(
        { ok: false, error: data?.error ?? "Payment initialization failed" },
        { status: res.status === 400 ? 400 : 502 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payment service is unreachable — please try again shortly." },
      { status: 502 }
    );
  }
}
