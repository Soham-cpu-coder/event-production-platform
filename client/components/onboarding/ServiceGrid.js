const SERVICES = [
  {
    key: "staging",
    title: "Staging & Scenic",
    tagline: "Custom stage design, backdrops, LED walls, and architectural lighting.",
  },
  {
    key: "audio-visual",
    title: "Audio / Visual Engineering",
    tagline: "Ultra-low-latency line arrays, robotic PTZ cameras, broadcast switchers, and pristine audio.",
  },
  {
    key: "keynote-management",
    title: "Keynote & Speaker Direction",
    tagline: "Confidence monitors, countdown timers, speaker green rooms, and rehearsed cue management.",
  },
  {
    key: "sponsor-integration",
    title: "Sponsor Activations",
    tagline: "Turnkey expo booths, branded charging lounges, interactive kiosks, and digital signage loops.",
  },
  {
    key: "streaming",
    title: "Global Hybrid & Streaming",
    tagline: "Multi-track 4K live broadcast, DVR playback, and synchronized live Q&A feeds.",
  },
  {
    key: "registration",
    title: "Attendee Registration & Badging",
    tagline: "Thermal badge printing, contactless check-in, lead capture, and session attendance tracking.",
  },
];

export default function ServiceGrid() {
  return (
    <section className="onboarding-section">
      <div className="section-header">
        <span className="badge">Production Capabilities</span>
        <h2>Full-spectrum event infrastructure</h2>
        <p className="muted">
          Select individual technical disciplines or engage us for unified turnkey production management.
        </p>
      </div>

      <div className="grid">
        {SERVICES.map((s) => (
          <article key={s.key} className="card service-card">
            <span className="badge">{s.key.replace("-", " ")}</span>
            <h3 style={{ marginTop: "0.6rem" }}>{s.title}</h3>
            <p className="muted small" style={{ margin: "0.4rem 0 0" }}>
              {s.tagline}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
