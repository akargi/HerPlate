"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePostAction, type ActionState } from "@/lib/admin/actions";
import type { StoredPost } from "@/lib/db";

const initialState: ActionState = {};

const inputClasses =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function PostEditor({ post }: { post?: StoredPost }) {
  const [state, formAction, pending] = useActionState(
    savePostAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <input type="hidden" name="originalSlug" value={post?.slug ?? ""} />

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-stone-700">
            Title <span className="text-accent-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post?.title}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-stone-700">
            Date <span className="text-accent-600">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-stone-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post?.category ?? "Program Updates"}
            className={inputClasses}
          >
            <option>Program Updates</option>
            <option>Community Stories</option>
            <option>Nutrition Education</option>
            <option>Press / Media</option>
            <option>Events Recap</option>
          </select>
        </div>
        <div>
          <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-stone-700">
            Author
          </label>
          <input
            id="author"
            name="author"
            defaultValue={post?.author ?? "HPTF Team"}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-stone-700">
          Excerpt <span className="text-accent-600">*</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          required
          defaultValue={post?.excerpt}
          placeholder="One or two sentences shown in listings and shares."
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-stone-700">
          Body <span className="text-accent-600">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          required
          defaultValue={post?.body.join("\n\n")}
          placeholder={"Write the post here. Separate paragraphs with a blank line."}
          className={`${inputClasses} font-mono text-[13px] leading-relaxed`}
        />
        <p className="mt-1 text-xs text-stone-500">
          Separate paragraphs with a blank line.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : post ? "Save changes" : "Publish post"}
        </button>
        <Link
          href="/admin/posts"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
