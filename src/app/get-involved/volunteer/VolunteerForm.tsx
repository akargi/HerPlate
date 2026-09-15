"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function VolunteerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-sm text-brand-800">
        Thank you for applying! We review applications monthly and will reach
        out about the next orientation.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(false);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "volunteer",
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          fields: {
            phone: String(data.get("phone") ?? ""),
            skills: String(data.get("skills") ?? ""),
            availability: String(data.get("availability") ?? ""),
          },
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="vol-name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Full name <span className="text-accent-600">*</span>
        </label>
        <input id="vol-name" name="name" required className={inputClasses} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="vol-email" className="mb-1.5 block text-sm font-medium text-stone-700">
            Email <span className="text-accent-600">*</span>
          </label>
          <input id="vol-email" name="email" type="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="vol-phone" className="mb-1.5 block text-sm font-medium text-stone-700">
            Phone
          </label>
          <input id="vol-phone" name="phone" type="tel" className={inputClasses} />
        </div>
      </div>
      <div>
        <label htmlFor="vol-skills" className="mb-1.5 block text-sm font-medium text-stone-700">
          Skills & interests
        </label>
        <textarea
          id="vol-skills"
          name="skills"
          rows={3}
          placeholder="e.g. nutrition background, photography, data entry, teaching…"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="vol-availability" className="mb-1.5 block text-sm font-medium text-stone-700">
          Availability <span className="text-accent-600">*</span>
        </label>
        <select id="vol-availability" name="availability" required className={inputClasses}>
          <option value="">Select…</option>
          <option>Weekdays only</option>
          <option>Weekends only</option>
          <option>Both weekdays and weekends</option>
          <option>Remote / flexible</option>
        </select>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong submitting your application — please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
