"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";

const EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "product-launch", label: "Product Launch" },
  { value: "summit", label: "Leadership Summit" },
  { value: "townhall", label: "Company Townhall" },
  { value: "exhibition", label: "Exhibition / Expo" },
  { value: "other", label: "Other Corporate Event" },
];

const VENUE_STATUSES = [
  { value: "booked", label: "Venue is already booked" },
  { value: "shortlisted", label: "Shortlisted potential venues" },
  { value: "need-help", label: "Need recommendations & sourcing" },
];

const SERVICE_OPTIONS = [
  { id: "staging", label: "Staging & Scenic Design" },
  { id: "audio-visual", label: "Audio / Visual & Lighting" },
  { id: "keynote-management", label: "Keynote & Speaker Direction" },
  { id: "sponsor-integration", label: "Sponsor Booths & Activations" },
  { id: "streaming", label: "Live Streaming & Broadcast" },
  { id: "registration", label: "Badge Printing & Check-in" },
];

const BUDGET_RANGES = [
  { value: "", label: "Select estimated budget (optional)" },
  { value: "under-50k", label: "Under $50,000" },
  { value: "50k-100k", label: "$50,000 – $100,000" },
  { value: "100k-250k", label: "$100,000 – $250,000" },
  { value: "250k-500k", label: "$250,000 – $500,000" },
  { value: "500k-plus", label: "$500,000+" },
];

const initialForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  eventType: "conference",
  expectedAttendees: "",
  preferredStartDate: "",
  durationDays: "1",
  venueStatus: "booked",
  services: ["staging", "audio-visual"],
  budgetRange: "",
  notes: "",
  honeypot: "",
};

function Field({ label, error, required, full, children }) {
  return (
    <label className={full ? "full" : ""}>
      <span>
        {label} {required && <span aria-hidden="true" style={{ color: "var(--danger)" }}>*</span>}
      </span>
      {children}
      {error && (
        <span className="field-error" role="alert" aria-live="polite">
          {error}
        </span>
      )}
    </label>
  );
}

export default function OnboardingForm() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleService = (serviceId) => {
    setForm((f) => {
      const exists = f.services.includes(serviceId);
      const updated = exists
        ? f.services.filter((s) => s !== serviceId)
        : [...f.services, serviceId];
      return { ...f, services: updated };
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // Client-side quick check
    if (!form.companyName.trim()) {
      setFieldErrors({ companyName: "Company name is required" });
      return;
    }
    if (!form.contactName.trim()) {
      setFieldErrors({ contactName: "Contact name is required" });
      return;
    }
    if (!form.email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }

    setBusy(true);

    try {
      const payload = {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        eventType: form.eventType,
        expectedAttendees: Number(form.expectedAttendees),
        preferredStartDate: form.preferredStartDate || undefined,
        durationDays: form.durationDays ? Number(form.durationDays) : undefined,
        venueStatus: form.venueStatus,
        services: form.services,
        budgetRange: form.budgetRange || undefined,
        notes: form.notes.trim() || undefined,
        honeypot: form.honeypot || undefined,
      };

      await api.submitOnboarding(payload);
      setSuccess(true);
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        const mapped = {};
        err.details.forEach((d) => {
          if (d.path) mapped[d.path] = d.message;
        });
        setFieldErrors(mapped);
      }
      setGeneralError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setFieldErrors({});
    setGeneralError("");
    setSuccess(false);
  }

  if (success) {
    return (
      <section id="onboarding-form" className="card onboarding-success" role="status" aria-live="polite">
        <span className="badge published">Request Received</span>
        <h2 style={{ marginTop: "0.8rem" }}>Thank you! Your event request has been received.</h2>
        <p className="muted" style={{ maxWidth: "580px", margin: "0.5rem auto 1.5rem" }}>
          We have received your event requirements. An executive producer will review your specifications
          and reach out within one business day to coordinate your discovery call.
        </p>
        <button type="button" className="btn secondary" onClick={handleReset}>
          Submit another request
        </button>
      </section>
    );
  }

  return (
    <section id="onboarding-form" className="onboarding-section">
      <div className="section-header">
        <span className="badge">Get Started</span>
        <h2>Submit an onboarding request</h2>
        <p className="muted">
          Fill out the details below to initiate your production discovery process. No obligation.
        </p>
      </div>

      <form className="form wide card" onSubmit={handleSubmit} noValidate={false}>
        {/* Honeypot field for bot detection */}
        <div style={{ display: "none" }} aria-hidden="true">
          <label htmlFor="hp_check">Do not fill this field</label>
          <input
            id="hp_check"
            name="honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={set("honeypot")}
          />
        </div>

        {/* Section 1: Company & Contact */}
        <div className="form-section-title full">
          <h3>1. Company & Contact Information</h3>
          <p className="muted small">Who should our production directors coordinate with?</p>
        </div>

        <Field label="Company Name" error={fieldErrors.companyName} required>
          <input
            type="text"
            value={form.companyName}
            onChange={set("companyName")}
            placeholder="e.g. Acme Technologies"
            maxLength={120}
            required
          />
        </Field>

        <Field label="Contact Person" error={fieldErrors.contactName} required>
          <input
            type="text"
            value={form.contactName}
            onChange={set("contactName")}
            placeholder="e.g. Sarah Jenkins"
            maxLength={80}
            required
          />
        </Field>

        <Field label="Work Email" error={fieldErrors.email} required>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="sarah@acme.com"
            required
          />
        </Field>

        <Field label="Direct Phone (optional)" error={fieldErrors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+1 (555) 012-3456"
            maxLength={30}
          />
        </Field>

        {/* Section 2: Your Event */}
        <div className="form-section-title full" style={{ marginTop: "1rem" }}>
          <h3>2. Your Event Specifications</h3>
          <p className="muted small">Core logistics, scale, and timeline parameters.</p>
        </div>

        <Field label="Event Type" error={fieldErrors.eventType} required>
          <select value={form.eventType} onChange={set("eventType")} required>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Expected Attendees" error={fieldErrors.expectedAttendees} required>
          <input
            type="number"
            min="1"
            max="1000000"
            value={form.expectedAttendees}
            onChange={set("expectedAttendees")}
            placeholder="e.g. 850"
            required
          />
        </Field>

        <Field label="Preferred Start Date (optional)" error={fieldErrors.preferredStartDate}>
          <input
            type="date"
            value={form.preferredStartDate}
            onChange={set("preferredStartDate")}
          />
        </Field>

        <Field label="Duration (Days)" error={fieldErrors.durationDays}>
          <input
            type="number"
            min="1"
            max="30"
            value={form.durationDays}
            onChange={set("durationDays")}
            placeholder="e.g. 2"
          />
        </Field>

        <Field label="Venue Status" error={fieldErrors.venueStatus} required full>
          <select value={form.venueStatus} onChange={set("venueStatus")} required>
            {VENUE_STATUSES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Section 3: What You Need */}
        <div className="form-section-title full" style={{ marginTop: "1rem" }}>
          <h3>3. Production Services Needed</h3>
          <p className="muted small">Select all capabilities required for your event scope.</p>
        </div>

        <div className="full services-checkbox-grid">
          {SERVICE_OPTIONS.map((srv) => {
            const isChecked = form.services.includes(srv.id);
            return (
              <label
                key={srv.id}
                className={`service-option-card ${isChecked ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleService(srv.id)}
                  style={{ width: "auto" }}
                />
                <span>{srv.label}</span>
              </label>
            );
          })}
        </div>

        <Field label="Estimated Production Budget (optional)" error={fieldErrors.budgetRange} full>
          <select value={form.budgetRange} onChange={set("budgetRange")}>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Section 4: Notes */}
        <div className="form-section-title full" style={{ marginTop: "1rem" }}>
          <h3>4. Additional Notes & Vision</h3>
          <p className="muted small">Share any specific themes, keynote speakers, or special technical requirements.</p>
        </div>

        <Field label="Project Notes (optional)" error={fieldErrors.notes} full>
          <textarea
            value={form.notes}
            onChange={set("notes")}
            placeholder="Tell us about your event theme, stage requirements, or questions for our producers..."
            maxLength={2000}
            rows={4}
          />
        </Field>

        {/* General Error Banner */}
        {generalError && (
          <div className="alert error full" role="alert" aria-live="polite">
            {generalError}
          </div>
        )}

        <div className="full" style={{ marginTop: "0.5rem" }}>
          <button type="submit" className="btn" disabled={busy} style={{ minWidth: "180px" }}>
            {busy ? "Submitting request…" : "Submit Onboarding Request →"}
          </button>
        </div>
      </form>
    </section>
  );
}
