import { PostEditor } from "../PostEditor";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-900">
        New post
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Publishes immediately to the News &amp; Resources page.
      </p>
      <div className="mt-8">
        <PostEditor />
      </div>
    </div>
  );
}
