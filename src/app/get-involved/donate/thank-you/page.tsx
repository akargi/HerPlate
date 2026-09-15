import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Thank you for your donation",
  description: "Your gift to Her Plate, Their Future Initiative.",
  robots: { index: false },
};

type SearchParams = Promise<{ reference?: string; status?: string }>;

const statusCopy: Record<string, { title: string; body: string }> = {
  success: {
    title: "Your gift is on its way to the field",
    body: "Your payment was received. A receipt is on its way to your email — thank you for nourishing women and children with us.",
  },
  pending: {
    title: "We're confirming your payment",
    body: "Your payment is being confirmed. You'll receive an email receipt as soon as it clears — usually within minutes.",
  },
  failed: {
    title: "The payment didn't go through",
    body: "No money has left your account. You can try again, or email us and we'll help you complete your gift.",
  },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { reference, status } = await searchParams;
  const copy = statusCopy[status ?? "pending"] ?? statusCopy.pending;

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-sm">
        <p aria-hidden className="text-5xl">
          {status === "failed" ? "💛" : "🎉"}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-brand-900">
          {copy.title}
        </h1>
        <p className="mt-4 leading-relaxed text-stone-600">{copy.body}</p>
        {reference && (
          <p className="mt-4 text-xs text-stone-400">
            Reference: <code className="font-mono">{reference}</code>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary">
            Back to home
          </ButtonLink>
          {status === "failed" ? (
            <ButtonLink href="/get-involved/donate" variant="outline">
              Try again
            </ButtonLink>
          ) : (
            <ButtonLink href="/our-work" variant="outline">
              See our work
            </ButtonLink>
          )}
        </div>
        <p className="mt-6 text-sm text-stone-500">
          Questions about your gift?{" "}
          <Link href="/contact" className="font-semibold text-brand-700 underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
