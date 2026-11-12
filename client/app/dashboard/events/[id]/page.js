"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { localToIso } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import Schedule from "@/components/Schedule";
import SponsorList from "@/components/SponsorList";

const SESSION_TYPES = ["keynote", "talk", "workshop", "panel", "break", "networking"];
const TIERS = ["platinum", "gold", "silver", "bronze"];

const emptySession = { title: "", type: "talk", stage: "", startTime: "", endTime: "", speakerName: "", speakerCompany: "", avNotes: "" };
const emptySponsor = { name: "", tier: "bronze", website: "", boothNumber: "", deliverables: "" };

export default function ManageEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionForm, setSessionForm] = useState(emptySession);
  const [sponsorForm, setSponsorForm] = useState(emptySponsor);

  const canManage = user && (user.role === "organizer" || user.role === "admin");

  const load = useCallback(() => {
    api
      .getEvent(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  useEffect(() => {
    if (loading) return;
    if (!canManage) {
      router.replace("/login");
      return;
    }
    load();
  }, [loading, canManage, router, load]);

  // Runs an API action, then refreshes; surfaces errors (e.g. stage clashes) inline.
  async function run(action, successMessage) {
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      load();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  }

  async function addSession(e) {
    e.preventDefault();
    const f = sessionForm;
    const ok = await run(
      () =>
        api.createSession(id, {
          title: f.title,
          type: f.type,
          stage: f.stage,
          startTime: localToIso(f.startTime),
          endTime: localToIso(f.endTime),
          speaker: { name: f.speakerName, company: f.speakerCompany },
          avNotes: f.avNotes,
        }),
      "Session added."
    );
    if (ok) setSessionForm(emptySession);
  }

  async function addSponsor(e) {
    e.preventDefault();
    const f = sponsorForm;
    const ok = await run(
      () =>
        api.createSponsor(id, {
          name: f.name,
          tier: f.tier,
          website: f.website,
          boothNumber: f.boothNumber,
          deliverables: f.deliverables
            .split("\n")
            .map((d) => d.trim())
            .filter(Boolean),
        }),
      "Sponsor added."
    );
    if (ok) setSponsorForm(emptySponsor);
  }

  async function setStatus(status) {
    await run(() => api.updateEvent(id, { status }), `Event is now ${status}.`);
  }

  async function removeEvent() {
    if (!window.confirm("Delete this event with all its sessions and sponsors?")) return;
    try {
      await api.deleteEvent(id);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (loading || !canManage) return <p className="muted">Loading…</p>;
  if (!data) return error ? <div className="alert error">{error}</div> : <p className="muted">Loading…</p>;

  const { event, sessions, sponsors } = data;
  const sf = (key) => (e) => setSessionForm((f) => ({ ...f, [key]: e.target.value }));
  const pf = (key) => (e) => setSponsorForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <Link href="/dashboard" className="small">
        ← Dashboard
      </Link>
      <div className="row between" style={{ marginTop: "0.75rem" }}>
        <div>
          <span className={`badge ${event.status}`}>{event.status}</span>
          <h1 style={{ marginTop: "0.4rem" }}>{event.title}</h1>
        </div>
        <div className="row">
          {event.status !== "published" && (
            <button className="btn" onClick={() => setStatus("published")}>
              Publish
            </button>
          )}
          {event.status === "published" && (
            <button className="btn secondary" onClick={() => setStatus("draft")}>
              Unpublish
            </button>
          )}
          <Link className="btn secondary" href={`/events/${event._id}`}>
            Public page
          </Link>
          <button className="btn danger" onClick={removeEvent}>
            Delete event
          </button>
        </div>
      </div>

      {error && <div className="alert error" style={{ marginTop: "1rem" }}>{error}</div>}
      {notice && <div className="alert ok" style={{ marginTop: "1rem" }}>{notice}</div>}

      {event.stages?.length > 0 && (
        <>
          <h2>Stages &amp; A/V</h2>
          <div className="stages">
            {event.stages.map((st) => (
              <div className="card" key={st.name}>
                <strong>{st.name}</strong>
                {st.capacity > 0 && <div className="muted small">Capacity {st.capacity}</div>}
                {st.avRequirements && <div className="muted small">{st.avRequirements}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Schedule</h2>
      <Schedule
        sessions={sessions}
        onDelete={(s) => run(() => api.deleteSession(id, s._id), "Session removed.")}
      />

      <h3 style={{ marginTop: "1.5rem" }}>Add a session</h3>
      <form className="form wide card" onSubmit={addSession}>
        <label className="full">
          Title
          <input value={sessionForm.title} onChange={sf("title")} required minLength={2} maxLength={160} />
        </label>
        <label>
          Type
          <select value={sessionForm.type} onChange={sf("type")}>
            {SESSION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Stage
          <input
            list="stage-options"
            value={sessionForm.stage}
            onChange={sf("stage")}
            required
            maxLength={80}
          />
          <datalist id="stage-options">
            {event.stages?.map((st) => (
              <option key={st.name} value={st.name} />
            ))}
          </datalist>
        </label>
        <label>
          Starts
          <input type="datetime-local" value={sessionForm.startTime} onChange={sf("startTime")} required />
        </label>
        <label>
          Ends
          <input type="datetime-local" value={sessionForm.endTime} onChange={sf("endTime")} required />
        </label>
        <label>
          Speaker
          <input value={sessionForm.speakerName} onChange={sf("speakerName")} maxLength={100} />
        </label>
        <label>
          Speaker company
          <input value={sessionForm.speakerCompany} onChange={sf("speakerCompany")} maxLength={100} />
        </label>
        <label className="full">
          A/V notes
          <input value={sessionForm.avNotes} onChange={sf("avNotes")} maxLength={1000} placeholder="Lav mic, clicker, playback video…" />
        </label>
        <div className="full">
          <button className="btn">Add session</button>
        </div>
      </form>

      <h2>Sponsors</h2>
      <SponsorList sponsors={sponsors} onDelete={(s) => run(() => api.deleteSponsor(id, s._id), "Sponsor removed.")} />

      <h3 style={{ marginTop: "1.5rem" }}>Add a sponsor</h3>
      <form className="form wide card" onSubmit={addSponsor}>
        <label>
          Name
          <input value={sponsorForm.name} onChange={pf("name")} required maxLength={120} />
        </label>
        <label>
          Tier
          <select value={sponsorForm.tier} onChange={pf("tier")}>
            {TIERS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Website
          <input type="url" value={sponsorForm.website} onChange={pf("website")} placeholder="https://" />
        </label>
        <label>
          Booth
          <input value={sponsorForm.boothNumber} onChange={pf("boothNumber")} maxLength={20} />
        </label>
        <label className="full">
          Deliverables (one per line)
          <textarea value={sponsorForm.deliverables} onChange={pf("deliverables")} placeholder={"Logo on main screen\nKeynote mention"} />
        </label>
        <div className="full">
          <button className="btn">Add sponsor</button>
        </div>
      </form>
    </>
  );
}
