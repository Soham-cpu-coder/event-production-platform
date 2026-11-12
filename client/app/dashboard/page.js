"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { localToIso } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/EventCard";

const emptyForm = { title: "", venue: "", description: "", startDate: "", endDate: "", stageName: "", stageCapacity: "" };

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canManage = user && (user.role === "organizer" || user.role === "admin");

  const load = useCallback(() => {
    api
      .listEvents("?mine=true&limit=50")
      .then((res) => setEvents(res.items))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!canManage) {
      router.replace("/login");
      return;
    }
    load();
  }, [loading, canManage, router, load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const stages = form.stageName.trim()
        ? [{ name: form.stageName.trim(), capacity: Number(form.stageCapacity) || 0 }]
        : [];
      const res = await api.createEvent({
        title: form.title,
        venue: form.venue,
        description: form.description,
        startDate: localToIso(form.startDate),
        endDate: localToIso(form.endDate),
        stages,
      });
      router.push(`/dashboard/events/${res.event._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading || !canManage) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Your events</h1>
      {events.length === 0 ? (
        <p className="muted">You haven&apos;t created an event yet.</p>
      ) : (
        <div className="grid">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} manageHref={`/dashboard/events/${ev._id}`} />
          ))}
        </div>
      )}

      <h2>Create an event</h2>
      <form className="form wide card" onSubmit={onCreate}>
        <label>
          Title
          <input value={form.title} onChange={set("title")} required minLength={3} maxLength={140} />
        </label>
        <label>
          Venue
          <input value={form.venue} onChange={set("venue")} required maxLength={200} />
        </label>
        <label>
          Starts
          <input type="datetime-local" value={form.startDate} onChange={set("startDate")} required />
        </label>
        <label>
          Ends
          <input type="datetime-local" value={form.endDate} onChange={set("endDate")} required />
        </label>
        <label>
          First stage (optional)
          <input value={form.stageName} onChange={set("stageName")} placeholder="Main Stage" maxLength={80} />
        </label>
        <label>
          Stage capacity
          <input type="number" min="0" value={form.stageCapacity} onChange={set("stageCapacity")} />
        </label>
        <label className="full">
          Description
          <textarea value={form.description} onChange={set("description")} maxLength={4000} />
        </label>
        {error && <div className="alert error full">{error}</div>}
        <div className="full">
          <button className="btn" disabled={busy}>
            {busy ? "Creating…" : "Create event"}
          </button>
        </div>
      </form>
    </>
  );
}
