"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import Schedule from "@/components/Schedule";
import SponsorList from "@/components/SponsorList";

export default function EventDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getEvent(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="muted">Loading…</p>;

  const { event, sessions, sponsors } = data;

  return (
    <>
      <Link href="/" className="small">
        ← All events
      </Link>
      <div className="row" style={{ marginTop: "0.75rem" }}>
        <span className={`badge ${event.status}`}>{event.status}</span>
        <span className="muted small">
          {formatDate(event.startDate)} – {formatDate(event.endDate)} · {event.venue}
        </span>
      </div>
      <h1 style={{ marginTop: "0.5rem" }}>{event.title}</h1>
      {event.description && <p className="muted" style={{ maxWidth: 720 }}>{event.description}</p>}

      {event.stages?.length > 0 && (
        <>
          <h2>Stages</h2>
          <div className="stages">
            {event.stages.map((st) => (
              <div className="card" key={st.name}>
                <strong>{st.name}</strong>
                {st.capacity > 0 && <div className="muted small">Capacity {st.capacity.toLocaleString("en-IN")}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Schedule</h2>
      <Schedule sessions={sessions} />

      <h2>Sponsors</h2>
      <SponsorList sponsors={sponsors} />
    </>
  );
}
