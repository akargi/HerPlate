import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/Section";
import { StatBar } from "@/components/ui/StatBar";
import {
  ProgramCard,
  StoryCard,
  PostCard,
} from "@/components/ui/Cards";
import { programs } from "@/content/programs";
import { stories } from "@/content/stories";
import { impactStats } from "@/content/impact";
import { impactImages } from "@/content/images";
import { listPosts } from "@/lib/db";

// The news preview reflects admin-managed posts.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = (await listPosts()).slice(0, 3);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <img src={impactImages.maternalNutrition.src} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-35" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900/90 to-brand-900/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Nourishing Women. Nourishing Children.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-100">
            Her Plate, Their Future Initiative is a Nigerian non-profit
            improving nutrition, food security and wellbeing among women, girls
            and children — particularly those in vulnerable and underserved
            communities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/get-involved/donate" variant="accent" size="lg">
              Donate Now
            </ButtonLink>
            <ButtonLink
              href="/programs"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              See Our Work
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Impact snapshot */}
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <StatBar stats={impactStats} />
          <p className="mt-6 text-center text-xs text-stone-500">
            Placeholder figures — replace with real, quarterly-updated numbers.
          </p>
        </div>
      </section>

      {/* Core message strip */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="font-display text-2xl leading-relaxed text-brand-900 sm:text-3xl">
          When we nourish and empower women and girls, we create healthier
          children, stronger families and a better future.
        </p>
        <Link
          href="/about"
          className="mt-6 inline-flex items-center gap-1 font-semibold text-accent-600 hover:text-accent-700"
        >
          Learn more about us <span aria-hidden>→</span>
        </Link>
      </section>

      {/* Featured programs */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="What we do"
            title="Our key areas of focus"
            description="Six integrated areas — from a mother's first pregnancy to the policies that shape what reaches her plate."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Stories of impact"
          title="The women behind the numbers"
          description="Names may be changed to protect privacy; every story is shared with consent."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>

      {/* Get involved banner */}
      <section className="bg-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Get involved"
            title="Three ways to stand with her"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Donate",
                text: "Fund nutrition classes, food support, and health screenings where they matter most.",
                href: "/get-involved/donate",
                cta: "Give now",
              },
              {
                title: "Volunteer",
                text: "Bring your skills to screenings, workshops, logistics, and storytelling.",
                href: "/get-involved/volunteer",
                cta: "Join the team",
              },
              {
                title: "Partner",
                text: "Corporates, NGOs, and institutions — scale this work with us.",
                href: "/get-involved/partner",
                cta: "Start a partnership",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brand-700 bg-brand-900/60 p-6"
              >
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-200">
                  {item.text}
                </p>
                <ButtonLink
                  href={item.href}
                  variant="accent"
                  className="mt-5"
                >
                  {item.cta}
                </ButtonLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="News & resources"
          title="Latest from the field"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/news" variant="outline">
            View all posts
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
