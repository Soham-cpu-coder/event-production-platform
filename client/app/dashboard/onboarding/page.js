"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["new", "contacted", "in-review", "onboarded", "declined"];

export default function AdminOnboardingDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [patchingId, setPatchingId] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const isAdmin = user && user.role === "admin";

  const loadRequests = useCallback((targetPage, targetFilter) => {
    const params = new URLSearchParams();
    params.set("page", targetPage);
    params.set("limit", 15);
    if (targetFilter) params.set("status", targetFilter);

    api
      .listOnboarding(`?${params.toString()}`)
      .then((res) => {
        setRequests(res.items || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
      })
      .catch((err) => {
        setError(errorMessage(err));
      })
      .finally(() => {
        setInitialLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.replace(user ? "/dashboard" : "/login");
      return;
    }
    loadRequests(page, statusFilter);
  }, [loading, isAdmin, user, router, page, statusFilter, loadRequests]);

  async function handleStatusChange(id, newStatus) {
    setPatchingId(id);
    setError("");
    try {
      await api.updateOnboardingStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPatchingId(null);
    }
  }

  if (loading || !isAdmin) {
    return <p className="muted">Verifying access…</p>;
  }

  return (
    <div className="admin-onboarding-container">
      <div className="row between" style={{ alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1>Onboarding Requests</h1>
          <p className="muted small">
            Review and triage inbound conference production requests ({total} total).
          </p>
        </div>

        <div className="row" style={{ gap: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "normal" }}>
            <span className="muted small">Filter status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: "auto" }}
            >
              <option value="">All statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <div className="alert error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {!initialLoaded ? (
        <p className="muted">Loading requests…</p>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
          <p className="muted">No onboarding requests found matching the criteria.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {requests.map((item) => (
            <article key={item._id} className="card onboarding-admin-card">
              <div className="row between" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <div className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>{item.companyName}</h3>
                    <span className={`badge ${item.status}`}>{item.status}</span>
                  </div>
                  <p className="muted small" style={{ margin: "0.2rem 0 0" }}>
                    Submitted on {formatDate(item.createdAt)} · Contact: <strong>{item.contactName}</strong> (
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                    {item.phone ? ` · ${item.phone}` : ""})
                  </p>
                </div>

                <div className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
                  <span className="small muted">Change status:</span>
                  <select
                    value={item.status}
                    disabled={patchingId === item._id}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.75rem",
                  background: "var(--bg)",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                }}
              >
                <div>
                  <span className="muted">Event Type:</span>{" "}
                  <strong>{item.eventType}</strong>
                </div>
                <div>
                  <span className="muted">Expected Attendees:</span>{" "}
                  <strong>{item.expectedAttendees?.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="muted">Preferred Date:</span>{" "}
                  <strong>{item.preferredStartDate ? formatDate(item.preferredStartDate) : "Flexible"}</strong>
                </div>
                <div>
                  <span className="muted">Duration:</span>{" "}
                  <strong>{item.durationDays ? `${item.durationDays} day(s)` : "Flexible"}</strong>
                </div>
                <div>
                  <span className="muted">Venue Status:</span>{" "}
                  <strong>{item.venueStatus}</strong>
                </div>
                <div>
                  <span className="muted">Budget:</span>{" "}
                  <strong>{item.budgetRange || "Not specified"}</strong>
                </div>
              </div>

              {item.services?.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <span className="muted small" style={{ marginRight: "0.5rem" }}>
                    Requested Services:
                  </span>
                  <div className="row" style={{ display: "inline-flex", gap: "0.35rem" }}>
                    {item.services.map((srv) => (
                      <span key={srv} className="badge" style={{ fontSize: "0.7rem" }}>
                        {srv.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.notes && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.88rem" }}>
                  <span className="muted">Notes:</span>
                  <p style={{ margin: "0.2rem 0 0", color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                    {item.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="pager">
          <button
            className="btn secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="muted small">
            Page {page} of {pages}
          </span>
          <button
            className="btn secondary"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
