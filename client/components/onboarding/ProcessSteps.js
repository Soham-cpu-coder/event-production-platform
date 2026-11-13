const STEPS = [
  {
    number: "01",
    title: "Tell us about your event",
    description:
      "Share your dates, venue status, expected attendees, and core production needs through our onboarding request.",
  },
  {
    number: "02",
    title: "Discovery call",
    description:
      "Our senior production leads meet with your team to review technical feasibility, branding goals, and creative vision.",
  },
  {
    number: "03",
    title: "Production plan",
    description:
      "We deliver stage renders, run-of-show blueprints, A/V equipment lists, and a comprehensive budget forecast.",
  },
  {
    number: "04",
    title: "Showtime",
    description:
      "Our full crew manages load-in, rehearsals, stage management, multi-camera streaming, and flawless live execution.",
  },
];

export default function ProcessSteps() {
  return (
    <section id="process-steps" className="onboarding-section">
      <div className="section-header">
        <span className="badge">Our Process</span>
        <h2>From initial concept to flawless execution</h2>
        <p className="muted">
          Every conference follows a battle-tested four-phase production lifecycle designed for corporate reliability.
        </p>
      </div>

      <div className="process-grid">
        {STEPS.map((step) => (
          <div key={step.number} className="card process-card">
            <span className="process-number">{step.number}</span>
            <h3 style={{ marginTop: "0.5rem" }}>{step.title}</h3>
            <p className="muted small" style={{ margin: "0.4rem 0 0" }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
