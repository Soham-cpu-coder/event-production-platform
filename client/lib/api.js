function getApiUrl() {
  let url = process.env.NEXT_PUBLIC_API_URL;
  if (url) {
    url = url.replace(/\/+$/, "");
    if (!url.endsWith("/api")) {
      url += "/api";
    }
    return url;
  }
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
    return "https://server-1see.vercel.app/api";
  }
  if (process.env.NODE_ENV === "production") {
    return "https://server-1see.vercel.app/api";
  }
  return "http://localhost:5000/api";
}

const TOKEN_KEY = "epp_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth ? tokenStore.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || "Request failed", res.status, data.details);
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
  login: (body) => request("/auth/login", { method: "POST", body, auth: false }),
  me: () => request("/auth/me"),

  listEvents: (query = "") => request(`/events${query}`),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) => request("/events", { method: "POST", body }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: "PATCH", body }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),

  createSession: (eventId, body) => request(`/events/${eventId}/sessions`, { method: "POST", body }),
  deleteSession: (eventId, id) => request(`/events/${eventId}/sessions/${id}`, { method: "DELETE" }),

  createSponsor: (eventId, body) => request(`/events/${eventId}/sponsors`, { method: "POST", body }),
  deleteSponsor: (eventId, id) => request(`/events/${eventId}/sponsors/${id}`, { method: "DELETE" }),

  submitOnboarding: (body) => request("/onboarding", { method: "POST", body, auth: false }),
  listOnboarding: (query = "") => request(`/onboarding${query}`),
  updateOnboardingStatus: (id, status) => request(`/onboarding/${id}/status`, { method: "PATCH", body: { status } }),
};

// Turns an ApiError (including field-level details) into one readable string.
export function errorMessage(err) {
  if (err?.details?.length) return err.details.map((d) => `${d.path ? d.path + ": " : ""}${d.message}`).join("; ");
  return err?.message || "Something went wrong";
}
