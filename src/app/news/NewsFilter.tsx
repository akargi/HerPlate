"use client";

import { useState } from "react";
import { PostCard } from "@/components/ui/Cards";
import type { Post } from "@/content/posts";

const categories = [
  "All",
  "Program Updates",
  "Community Stories",
  "Nutrition Education",
  "Press / Media",
  "Events Recap",
] as const;

export function NewsFilter({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const visible =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === category
                ? "bg-brand-700 text-white"
                : "border border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-center text-sm text-stone-500">
          No posts in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
