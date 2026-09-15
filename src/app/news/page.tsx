import type { Metadata } from "next";
import { PageHero } from "@/components/ui/Section";
import { listPosts } from "@/lib/db";
import { NewsFilter } from "./NewsFilter";

export const metadata: Metadata = {
  title: "News & Resources",
  description:
    "Program updates, community stories, nutrition education, and press from HPTF.",
};

// Post content is admin-managed and can change at any time.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="News & resources"
        title="Updates from the field"
        description="Program news, practical nutrition education, community stories, and press coverage."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <NewsFilter posts={await listPosts()} />
      </section>
    </>
  );
}
