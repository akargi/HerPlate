import type { Metadata } from "next";
import { PageHero } from "@/components/ui/Section";
import { Field, FormShell, fieldClasses } from "@/components/ui/Forms";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Corporate, NGO, government, and institutional partnerships with HPTF — funding, in-kind, technical, and advocacy.",
};

const partnershipTypes = [
  {
    title: "Funding partnerships",
    description:
      "Program sponsorship, matched giving, and multi-year commitments with agreed reporting.",
  },
  {
    title: "In-kind support",
    description:
      "Food items, agricultural inputs, supplements, logistics, or professional services.",
  },
  {
    title: "Technical partnerships",
    description:
      "Clinical expertise, M&E support, training curricula, and operational know-how.",
  },
  {
    title: "Advocacy partnerships",
    description:
      "Joint campaigns and policy engagement on nutrition, food security, and child health.",
  },
];

export default function PartnerPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Scale this work with us"
        description="We design partnerships around what your organisation does best — and report against what actually changed."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {partnershipTypes.map((type) => (
            <div
              key={type.title}
              className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm"
            >
              <h2 className="font-display text-lg font-bold text-brand-900">
                {type.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {type.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-bold text-brand-900">
              Start a conversation
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Tell us who you are and what you have in mind — we reply within
              five working days.
            </p>
            <div className="mt-6">
              <FormShell
                successMessage="Thank you — our partnerships team will be in touch shortly."
                submitLabel="Send inquiry"
                submissionType="partner"
              >
                <>
                    <Field label="Organisation" htmlFor="p-org" required>
                      <input id="p-org" name="organisation" required className={fieldClasses} />
                    </Field>
                    <Field label="Your name" htmlFor="p-name" required>
                      <input id="p-name" name="name" required className={fieldClasses} />
                    </Field>
                    <Field label="Work email" htmlFor="p-email" required>
                      <input id="p-email" name="email" type="email" required className={fieldClasses} />
                    </Field>
                    <Field label="Partnership interest" htmlFor="p-type">
                      <select id="p-type" name="interest" className={fieldClasses}>
                        <option>Funding</option>
                        <option>In-kind support</option>
                        <option>Technical</option>
                        <option>Advocacy</option>
                        <option>Not sure yet — let&apos;s discuss</option>
                      </select>
                    </Field>
                    <Field label="Message" htmlFor="p-message" required>
                      <textarea id="p-message" name="message" rows={4} required className={fieldClasses} />
                    </Field>
                </>
              </FormShell>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-brand-900">
              Why partner with HPTF
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-600">
              <li className="flex gap-3">
                <span aria-hidden className="text-brand-500">✓</span>
                Community trust built through local facilitators and
                long-term presence.
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="text-brand-500">✓</span>
                Outcome measurement built into every program, with reporting
                your CSR/ESG team can use.
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="text-brand-500">✓</span>
                Transparent finances published annually.
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="text-brand-500">✓</span>
                A focused mission — nutrition for women and children — where
                small grants move the needle.
              </li>
            </ul>
            <div className="mt-8 rounded-2xl bg-brand-900 p-6 text-white">
              <h3 className="font-display text-lg font-bold text-accent-300">
                Prefer email?
              </h3>
              <p className="mt-2 text-sm text-brand-200">
                Write to us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="font-semibold underline"
                >
                  {site.email}
                </a>{" "}
                with the subject line &quot;Partnership&quot;.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
