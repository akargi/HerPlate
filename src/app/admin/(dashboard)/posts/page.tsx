import Link from "next/link";
import { listPosts } from "@/lib/db";
import { deletePostAction } from "@/lib/admin/actions";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const posts = await listPosts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            News posts
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Everything published here appears on the News &amp; Resources page.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + New post
        </Link>
      </div>

      {saved && (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          ✓ Saved — the public news page is updated.
        </p>
      )}

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-display text-lg font-semibold text-stone-700">
            No posts yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Write your first update for the News &amp; Resources page.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {post.category}
                  </span>
                  <h2 className="mt-2 font-semibold text-stone-800">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                    {post.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-stone-400">
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {post.author} · /news/{post.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/posts/${post.slug}`}
                    className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/news/${post.slug}`}
                    target="_blank"
                    className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    View ↗
                  </Link>
                  <form action={deletePostAction}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
