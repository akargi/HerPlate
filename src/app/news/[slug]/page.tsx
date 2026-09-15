import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/Section";
import { PlaceholderImage } from "@/components/ui/StatBar";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getPost, listPosts } from "@/lib/db";
import { impactImages } from "@/content/images";

type Params = { slug: string };

// Post content is admin-managed and can change at any time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = (await listPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);
  const shareUrl = `/news/${post.slug}`;

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title}>
        <p className="text-sm text-brand-200">
          {new Date(post.date).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · By {post.author}
        </p>
      </PageHero>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <PlaceholderImage
          label="Post hero image (with consent)"
          className="aspect-16/9"
          image={impactImages.foodSecurity}
        />
        <div className="mt-10 space-y-5 text-lg leading-relaxed text-stone-700">
          {post.body.map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4 border-t border-brand-100 pt-6">
          <span className="text-sm font-semibold text-stone-600">Share:</span>
          {[
            { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(post.title)}` },
            { label: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(post.title)}` },
            { label: "Facebook", href: "https://facebook.com/sharer/sharer.php" },
            { label: "Copy link", href: shareUrl },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full border border-brand-200 px-4 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
            >
              {item.label}
            </a>
          ))}
        </div>
      </article>

      <section className="border-t border-brand-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-xl font-bold text-brand-900">
            Related posts
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/news/${rel.slug}`}
                className="group rounded-2xl border border-brand-100 bg-cream p-6 transition-colors hover:bg-brand-50"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-accent-600">
                  {rel.category}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-brand-900 group-hover:text-brand-700">
                  {rel.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600">{rel.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/news" variant="outline">
              All news & resources
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
