export default function SponsorList({ sponsors, onDelete }) {
  if (!sponsors.length) return <p className="muted">No sponsors yet.</p>;

  const order = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const sorted = [...sponsors].sort((a, b) => order[a.tier] - order[b.tier] || a.name.localeCompare(b.name));

  return (
    <div className="grid">
      {sorted.map((s) => (
        <div className="card" key={s._id}>
          <div className="row between">
            <strong>{s.name}</strong>
            <span className={`badge ${s.tier}`}>{s.tier}</span>
          </div>
          {s.boothNumber && <div className="muted small">Booth {s.boothNumber}</div>}
          {s.website && (
            <div className="small">
              <a href={s.website} target="_blank" rel="noopener noreferrer">
                {s.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {onDelete && s.deliverables?.length > 0 && (
            <ul className="small muted" style={{ paddingLeft: "1.1rem", marginBottom: 0 }}>
              {s.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          {onDelete && (
            <div style={{ marginTop: "0.6rem" }}>
              <button className="btn danger" onClick={() => onDelete(s)}>
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
