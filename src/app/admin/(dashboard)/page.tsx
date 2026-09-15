import Link from "next/link";
import {
  listEvents,
  listPosts,
  listSubmissions,
  type Submission,
} from "@/lib/db";

const typeLabels: Record<Submission["type"], string> = {
  contact: "Contact",
  volunteer: "Volunteer",
  partner: "Partner",
  newsletter: "Newsletter",
  donation: "Donation",
};

export default async function AdminDashboardPage() {
  const submissions = await listSubmissions();
  const posts = await listPosts();
  const events = await listEvents();

  const newCount = submissions.filter((s) => s.status === "new").length;
  const recent = submissions.slice(0, 5);

  const stats = [
    { label: "New inquiries", value: newCount, href: "/admin/inquiries" },
    { label: "Total inquiries", value: submissions.length, href: "/admin/inquiries" },
    { label: "News posts", value: posts.length, href: "/admin/posts" },
    { label: "Events", value: events.length, href: "/admin/events" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Welcome back — here&apos;s what&apos;s happening on the site.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-300"
          >
            <p className="font-display text-3xl font-bold text-brand-800">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-stone-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-900">
              Recent inquiries
            </h2>
            <Link
              href="/admin/inquiries"
              className="text-sm font-semibold text-accent-600 hover:text-accent-700"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">
              No inquiries yet. Form submissions from the public site will
              appear here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.status === "new"
                        ? "bg-accent-100 text-accent-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {typeLabels[s.type]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-stone-700">
                    <strong className="font-semibold">{s.name}</strong>
                  </span>
                  <span className="shrink-0 text-xs text-stone-400">
                    {new Date(s.receivedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-brand-900">
            Quick actions
          </h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/admin/posts/new"
              className="rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              ✏️ Write a news post
            </Link>
            <Link
              href="/admin/events/new"
              className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              📅 Add an event
            </Link>
            <Link
              href="/admin/inquiries"
              className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              📥 Review inquiries
            </Link>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            Everything you publish here appears on the public site immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
