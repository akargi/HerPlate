"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveEventAction, type ActionState } from "@/lib/admin/actions";
import type { StoredEvent } from "@/lib/db";

const initialState: ActionState = {};

const inputClasses =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function EventEditor({ event }: { event?: StoredEvent }) {
  const [state, formAction, pending] = useActionState(
    saveEventAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <input type="hidden" name="id" value={event?.id ?? ""} />

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-stone-700">
          Title <span className="text-accent-600">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          className={inputClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-stone-700">
            Date <span className="text-accent-600">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={event?.date}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-stone-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={event?.status ?? "upcoming"}
            className={inputClasses}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-stone-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={event?.location ?? "Kaduna, Nigeria"}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-stone-700">
          Description <span className="text-accent-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={event?.description}
          className={inputClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cta" className="mb-1.5 block text-sm font-medium text-stone-700">
            Button label (optional)
          </label>
          <input
            id="cta"
            name="cta"
            placeholder="e.g. Register / RSVP"
            defaultValue={event?.cta ?? ""}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="ctaHref" className="mb-1.5 block text-sm font-medium text-stone-700">
            Button link (optional)
          </label>
          <input
            id="ctaHref"
            name="ctaHref"
            placeholder="/contact or https://…"
            defaultValue={event?.ctaHref ?? ""}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : event ? "Save changes" : "Add event"}
        </button>
        <Link
          href="/admin/events"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
