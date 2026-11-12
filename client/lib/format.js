export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const formatDay = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

// Groups sessions (already sorted by start time) by calendar day.
export function groupByDay(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const key = new Date(s.startTime).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}

// <input type="datetime-local"> value -> ISO string
export const localToIso = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString();
};
