import { notFound } from "next/navigation";
import { listEvents } from "@/lib/db";
import { EventEditor } from "../EventEditor";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = (await listEvents()).find((e) => e.id === id);
  if (!event) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Edit event
      </h1>
      <p className="mt-1 text-sm text-stone-600">{event.title}</p>
      <div className="mt-8">
        <EventEditor event={event} />
      </div>
    </div>
  );
}
