import Link from "next/link";
import {
  listSubmissions,
  type Submission,
  type SubmissionType,
} from "@/lib/db";
import {
  deleteSubmissionAction,
  markSubmissionAction,
} from "@/lib/admin/actions";

const typeLabels: Record<SubmissionType, string> = {
  contact: "Contact",
  volunteer: "Volunteer",
  partner: "Partner",
  newsletter: "Newsletter",
  donation: "Donation",
};

const filters: { key: SubmissionType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "volunteer", label: "Volunteer" },
  { key: "partner", label: "Partner" },
  { key: "newsletter", label: "Newsletter" },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const active = filters.some((f) => f.key === type)
    ? (type as SubmissionType | "all")
    : "all";

  const submissions = await listSubmissions(active === "all" ? undefined : active);

  const fieldLabels: Record<string, string> = {
    subject: "Subject",
    message: "Message",
    skills: "Skills & interests",
    availability: "Availability",
    organisation: "Organisation",
    interest: "Interest",
    phone: "Phone",
    fund: "Fund",
    amount: "Amount",
    frequency: "Frequency",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Messages, applications, and signups from the public site forms.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/inquiries" : `/admin/inquiries?type=${f.key}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                active === f.key
                  ? "bg-brand-700 text-white"
                  : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-stone-700">
            No inquiries here yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Submissions from the contact, volunteer, partner, and newsletter
            forms will land in this inbox.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {submissions.map((s: Submission) => (
            <li
              key={s.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                s.status === "new" ? "border-accent-300" : "border-stone-200"
              }`}
            >
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 [&::-webkit-details-marker]:hidden">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.status === "new"
                        ? "bg-accent-100 text-accent-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {typeLabels[s.type]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800">
                    {s.name}
                    <span className="font-normal text-stone-500">
                      {" "}
                      · {s.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-stone-400">
                    {new Date(s.receivedAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {s.status === "new" && (
                    <span className="shrink-0 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      New
                    </span>
                  )}
                </summary>

                <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                  {Object.entries(s.fields).length === 0 ? (
                    <p className="text-sm text-stone-500">No extra details.</p>
                  ) : (
                    Object.entries(s.fields).map(([key, value]) => (
                      <p key={key} className="text-sm text-stone-700">
                        <span className="font-semibold text-stone-800">
                          {fieldLabels[key] ?? key}:
                        </span>{" "}
                        {value}
                      </p>
                    ))
                  )}
                  <div className="flex flex-wrap gap-2 pt-3">
                    <a
                      href={`mailto:${s.email}`}
                      className="rounded-full bg-brand-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
                    >
                      Reply by email
                    </a>
                    <form action={markSubmissionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={s.status === "new" ? "handled" : "new"}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        {s.status === "new" ? "Mark handled" : "Reopen"}
                      </button>
                    </form>
                    <form action={deleteSubmissionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
