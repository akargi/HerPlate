"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  if (submitted) {
    return (
      <p className="mt-4 rounded-xl bg-brand-900 px-4 py-3 text-sm text-accent-200">
        Thank you — please check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form
      className="mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "newsletter",
              name: email,
              email,
              fields: {},
            }),
          });
        } catch {
          // Silent — a failed newsletter capture shouldn't scare the user off.
        } finally {
          setPending(false);
          setSubmitted(true);
        }
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full min-w-0 rounded-full border border-brand-700 bg-brand-900 px-4 py-2.5 text-sm text-white placeholder:text-brand-300 focus:border-accent-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
