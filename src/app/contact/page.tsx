import type { Metadata } from "next";
import { PageHero } from "@/components/ui/Section";
import { Field, FormShell, fieldClasses } from "@/components/ui/Forms";
import { FaqAccordion } from "./FaqAccordion";
import { faqs } from "@/content/faqs";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with HPTF — questions, ideas, and collaborations welcome.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        description="Questions about our work, donations, volunteering, or partnerships — we read everything and reply within five working days."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-bold text-brand-900">
              Send a message
            </h2>
            <div className="mt-6">
              <FormShell
                successMessage="Thank you for reaching out — we'll reply within five working days."
                submitLabel="Send message"
                submissionType="contact"
              >
                <Field label="Name" htmlFor="c-name" required>
                  <input id="c-name" name="name" required className={fieldClasses} />
                </Field>
                <Field label="Email" htmlFor="c-email" required>
                  <input id="c-email" name="email" type="email" required className={fieldClasses} />
                </Field>
                <Field label="Subject" htmlFor="c-subject" required>
                  <select id="c-subject" name="subject" className={fieldClasses}>
                    <option>General inquiry</option>
                    <option>Donations & receipts</option>
                    <option>Volunteering</option>
                    <option>Partnership</option>
                    <option>Press & media</option>
                  </select>
                </Field>
                <Field label="Message" htmlFor="c-message" required>
                  <textarea id="c-message" name="message" rows={5} required className={fieldClasses} />
                </Field>
              </FormShell>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-brand-900 p-6 text-white">
              <h2 className="font-display text-xl font-bold text-accent-300">
                Reach us directly
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-brand-100">
                <li>
                  Email:{" "}
                  <a href={`mailto:${site.email}`} className="font-semibold underline">
                    {site.email}
                  </a>
                </li>
                <li>Phone: {site.phone}</li>
                <li>Address: {site.address}</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-brand-700 px-4 py-1.5 text-xs font-semibold text-brand-100 hover:bg-brand-800"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-sm text-stone-500">
              Embedded map placeholder — connect Google Maps once the office
              address is final
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-brand-900">
                Frequently asked questions
              </h2>
              <div className="mt-4">
                <FaqAccordion faqs={faqs} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
