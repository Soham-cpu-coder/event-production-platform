"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import EventCard from "@/components/EventCard";

export default function HomePage() {
  const [page, setPage] = useState(1);
  // Result is tagged with the page it belongs to, so "loading" is derived rather than set in an effect.
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listEvents(`?page=${page}&limit=9`)
      .then((res) => !cancelled && setResult({ page, items: res.items, pages: res.pages, error: "" }))
      .catch((err) => !cancelled && setResult({ page, items: [], pages: 1, error: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const loading = !result || result.page !== page;
  const data = result || { items: [], pages: 1 };
  const error = result?.error || "";

  return (
    <>
      <section className="hero">
        <h1>Conferences, produced end to end.</h1>
        <p>
          Browse upcoming multi-day conferences — stages, keynotes, workshops and the sponsors who make them happen.
        </p>
        <div className="row" style={{ marginTop: "1rem" }}>
          <Link href="/onboarding" className="btn secondary">
            Planning an event? Work with us →
          </Link>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <p className="muted">Loading events…</p>
      ) : data.items.length === 0 ? (
        <p className="muted">No published events yet.</p>
      ) : (
        <div className="grid">
          {data.items.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted small">
            Page {page} of {data.pages}
          </span>
          <button className="btn secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
