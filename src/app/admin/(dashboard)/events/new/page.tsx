import { EventEditor } from "../EventEditor";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-900">
        New event
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Publishes immediately to the public Events page.
      </p>
      <div className="mt-8">
        <EventEditor />
      </div>
    </div>
  );
}
