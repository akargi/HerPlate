"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const fieldClasses =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function Field({
  label,
  htmlFor,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-stone-700"
      >
        {label}
        {required && <span className="text-accent-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function FormShell({
  children,
  successMessage,
  submitLabel = "Submit",
  submissionType,
}: {
  children: ReactNode;
  successMessage: string;
  submitLabel?: string;
  /** When set, the form POSTs to the submissions API and lands in the admin inbox. */
  submissionType?: "contact" | "volunteer" | "partner";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-sm text-brand-800">
        {successMessage}
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!submissionType) {
      setSubmitted(true);
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const fields: Record<string, string> = {};
    data.forEach((value, key) => {
      if (key !== "name" && key !== "email") {
        fields[key] = String(value);
      }
    });

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: submissionType, name, email, fields }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {children}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong sending your message — please try again, or
          email us directly.
        </p>
      )}
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export { fieldClasses };
