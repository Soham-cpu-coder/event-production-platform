import { formatDay, formatTime, groupByDay } from "@/lib/format";

// `onDelete` is optional: when provided, each session shows a remove button (organizer view).
export default function Schedule({ sessions, onDelete }) {
  if (!sessions.length) return <p className="muted">No sessions scheduled yet.</p>;

  return (
    <div>
      {groupByDay(sessions).map((day) => (
        <section key={day[0].startTime}>
          <h3 className="day-title">{formatDay(day[0].startTime)}</h3>
          <div className="card">
            {day.map((s) => (
              <div className="session" key={s._id}>
                <div className="time">
                  {formatTime(s.startTime)}
                  <div className="muted small">to {formatTime(s.endTime)}</div>
                </div>
                <div>
                  <strong>{s.title}</strong>
                  <div className="meta">
                    <span className="badge">{s.type}</span>
                    <span className="muted small">{s.stage}</span>
                  </div>
                  {s.speaker?.name && (
                    <div className="small" style={{ marginTop: "0.35rem" }}>
                      {s.speaker.name}
                      {(s.speaker.title || s.speaker.company) && (
                        <span className="muted">
                          {" "}
                          — {[s.speaker.title, s.speaker.company].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                  {onDelete && s.avNotes && <div className="muted small">A/V: {s.avNotes}</div>}
                </div>
                {onDelete && (
                  <button className="btn danger" onClick={() => onDelete(s)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
