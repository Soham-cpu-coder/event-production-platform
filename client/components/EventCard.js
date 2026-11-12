import Link from "next/link";
import { formatDate } from "@/lib/format";

export default function EventCard({ event, manageHref }) {
  return (
    <article className="card">
      <div className="row between">
        <span className={`badge ${event.status}`}>{event.status}</span>
        <span className="muted small">
          {formatDate(event.startDate)}
          {event.endDate !== event.startDate ? ` – ${formatDate(event.endDate)}` : ""}
        </span>
      </div>
      <h3 style={{ marginTop: "0.6rem" }}>{event.title}</h3>
      <p className="muted small" style={{ margin: "0 0 0.8rem" }}>
        {event.venue}
        {event.stages?.length ? ` · ${event.stages.length} stage${event.stages.length > 1 ? "s" : ""}` : ""}
      </p>
      <div className="row">
        <Link href={`/events/${event._id}`}>View event →</Link>
        {manageHref && <Link href={manageHref}>Manage</Link>}
      </div>
    </article>
  );
}
