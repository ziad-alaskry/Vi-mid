// Slot + date helpers (front-end only)

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function pad(n) { return String(n).padStart(2, "0"); }

export function fmtTime(h, m) {
  const ampm = h < 12 ? "am" : "pm";
  let hh = h % 12; if (hh === 0) hh = 12;
  return `${hh}:${pad(m)} ${ampm}`;
}

export function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function prettyDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// Next N dates that match the availability's weekdays
export function upcomingDatesFor(availability, count = 14) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < 45 && out.length < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (availability.days.includes(d.getDay())) out.push(isoDate(d));
  }
  return out;
}

// Concrete slot times for a given availability (minutes-of-day grid)
export function slotsForDay(availability) {
  const { startH, endH, slotMinutes } = availability;
  const out = [];
  for (let mins = startH * 60; mins + slotMinutes <= endH * 60; mins += slotMinutes) {
    out.push({ h: Math.floor(mins / 60), m: mins % 60, label: fmtTime(Math.floor(mins / 60), mins % 60) });
  }
  return out;
}

export function clampSlot(mins) {
  return Math.max(5, Math.min(60, mins));
}
