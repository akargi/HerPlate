import type { Metadata } from "next";
import { PageHero } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { listEvents } from "@/lib/db";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming HPTF events, screenings, and volunteer orientations.",
};

// Event content is admin-managed and can change at any time.
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listEvents();
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Come see the work up close"
        description="Screenings, workshops, orientations, and community days — join us in person or online."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-bold text-brand-900">
          Upcoming events
        </h2>
        <div className="mt-8 space-y-4">
          {upcoming.map((event) => (
            <div
              key={event.title}
              className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="sm:w-40 sm:shrink-0">
                <p className="font-display text-lg font-bold text-accent-600">
                  {event.dateLabel}
                </p>
                <p className="text-xs text-stone-500">{event.location}</p>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-brand-900">{event.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {event.description}
                </p>
              </div>
              {event.cta && event.ctaHref && (
                <ButtonLink href={event.ctaHref} variant="outline" className="sm:self-center">
                  {event.cta}
                </ButtonLink>
              )}
            </div>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold text-brand-900">
          Past events
        </h2>
        <div className="mt-8 space-y-4">
          {past.map((event) => (
            <div
              key={event.title}
              className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-cream p-6 sm:flex-row sm:items-center"
            >
              <div className="sm:w-40 sm:shrink-0">
                <p className="text-sm font-semibold text-stone-500">
                  {event.dateLabel}
                </p>
                <p className="text-xs text-stone-500">{event.location}</p>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-700">{event.title}</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {event.description}
                </p>
              </div>
              {event.cta && event.ctaHref && (
                <ButtonLink href={event.ctaHref} variant="ghost" className="sm:self-center">
                  {event.cta}
                </ButtonLink>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
