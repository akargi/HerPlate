import Link from "next/link";
import { listEvents } from "@/lib/db";
import { deleteEventAction } from "@/lib/admin/actions";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const events = await listEvents();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Events
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Upcoming and past events shown on the public Events page.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + New event
        </Link>
      </div>

      {saved && (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          ✓ Saved — the public events page is updated.
        </p>
      )}

      {events.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-stone-700">
            No events yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Add your first screening, workshop, or orientation.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      event.status === "upcoming"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {event.status}
                  </span>
                  <h2 className="mt-2 font-semibold text-stone-800">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {event.dateLabel} · {event.location}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                    {event.description}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Edit
                  </Link>
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
