import { notFound } from "next/navigation";
import { getPost } from "@/lib/db";
import { PostEditor } from "../PostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Edit post
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        /news/{post.slug}
      </p>
      <div className="mt-8">
        <PostEditor post={post} />
      </div>
    </div>
  );
}
