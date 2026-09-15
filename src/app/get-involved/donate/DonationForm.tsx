"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { donationTiers } from "@/content/site";
import { fundSlug, programs } from "@/content/programs";

const fundLabels: Record<string, string> = Object.fromEntries(
  programs.map((program) => [fundSlug(program.fund), program.fund])
);

type InitResponse =
  | { ok: true; reference: string; authorizationUrl: string }
  | { ok: false; demo?: boolean; error: string };

export function DonationForm() {
  return (
    <Suspense fallback={null}>
      <DonationFormInner />
    </Suspense>
  );
}

function DonationFormInner() {
  const searchParams = useSearchParams();
  const fundParam = searchParams.get("fund");

  const [amount, setAmount] = useState<string>("₦25,000");
  const [custom, setCustom] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [fund, setFund] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "redirecting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Sync the URL ?fund= param into state after hydration (deep links from
    // program pages). Can't be a lazy useState initializer because the
    // prerendered HTML has no query params.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fundParam && fundLabels[fundParam]) setFund(fundParam);
  }, [fundParam]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDemoNotice(null);

    const raw = custom.trim() || amount.replace(/[₦,\s]/g, "");
    const naira = Number(raw);
    if (!Number.isFinite(naira) || naira < 500) {
      setError("Please choose an amount of at least ₦500.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email so we can send your receipt.");
      return;
    }

    setStatus("starting");
    try {
      const res = await fetch("/api/donations/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || email.trim(),
          amount: naira,
          fund,
          frequency,
        }),
      });
      const data = (await res.json()) as InitResponse;

      if (data.ok && data.authorizationUrl) {
        setStatus("redirecting");
        window.location.assign(data.authorizationUrl);
        return;
      }
      if (data.ok === false && data.demo) {
        setDemoNotice(
          "Thank you! Online payments are being finalised, so your pledge was recorded as a demonstration — email us to complete your gift."
        );
        setStatus("idle");
        return;
      }
      setError(data.error ?? "Could not start the payment. Please try again.");
    } catch {
      setError("Network problem — please check your connection and try again.");
    }
    setStatus("idle");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm"
    >
      {/* Frequency */}
      <div className="inline-flex rounded-full bg-brand-50 p-1">
        {(["once", "monthly"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFrequency(option)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              frequency === option
                ? "bg-brand-700 text-white"
                : "text-brand-800 hover:text-brand-900"
            }`}
          >
            {option === "once" ? "Give once" : "Give monthly"}
          </button>
        ))}
      </div>

      {/* Amounts */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {donationTiers.map((tier) => (
          <button
            key={tier.amount}
            type="button"
            onClick={() => {
              setAmount(tier.amount);
              setCustom("");
            }}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
              amount === tier.amount && !custom
                ? "border-brand-700 bg-brand-50 text-brand-900"
                : "border-stone-300 text-stone-600 hover:border-brand-400"
            }`}
          >
            {tier.amount}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <label htmlFor="custom-amount" className="sr-only">
          Custom amount
        </label>
        <input
          id="custom-amount"
          inputMode="decimal"
          placeholder="Other amount (₦)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {/* Fund designation */}
      <div className="mt-5">
        <label
          htmlFor="fund"
          className="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Direct my gift to
        </label>
        <select
          id="fund"
          value={fund}
          onChange={(e) => setFund(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="general">Where it&apos;s needed most (General Fund)</option>
          {Object.entries(fundLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Donor details */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="donor-name" className="mb-1.5 block text-sm font-medium text-stone-700">
            Name <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="donor-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label htmlFor="donor-email" className="mb-1.5 block text-sm font-medium text-stone-700">
            Email <span aria-hidden className="text-accent-600">*</span>
          </label>
          <input
            id="donor-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {demoNotice && (
        <p role="status" className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {demoNotice}
        </p>
      )}

      <button
        type="submit"
        disabled={status !== "idle"}
        className="mt-6 w-full rounded-full bg-accent-500 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "idle"
          ? `Donate ${custom ? custom : amount} ${frequency === "monthly" ? "monthly" : "now"}`
          : status === "starting"
            ? "Starting secure checkout…"
            : "Redirecting to secure payment…"}
      </button>
      <p className="mt-3 text-center text-xs text-stone-500">
        You&apos;ll complete payment on our secure Paystack checkout — we never
        see your card details.
      </p>
    </form>
  );
}
