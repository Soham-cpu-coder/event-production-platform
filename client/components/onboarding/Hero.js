import Link from "next/link";

export default function Hero() {
  return (
    <section className="onboarding-hero card">
      <div className="onboarding-hero-content">
        <span className="badge">Production & Experience Design</span>
        <h1 style={{ marginTop: "0.8rem", fontSize: "2.3rem" }}>
          Turn your annual conference into an unforgettable experience.
        </h1>
        <p className="muted" style={{ fontSize: "1.1rem", maxWidth: "680px", margin: "0.8rem 0 1.5rem" }}>
          We handle stage design, high-fidelity audio/visual, keynote speaker direction,
          sponsor activations, and seamless live broadcasts. Tell us about your vision,
          and our executive production team will build your custom roadmap.
        </p>
        <div className="row">
          <a href="#onboarding-form" className="btn">
            Get started with EventFlow →
          </a>
          <a href="#process-steps" className="btn secondary">
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
