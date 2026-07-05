// Slot + date helpers (front-end only)

const DAY_LABELS_BY_LOCALE = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
};
export function dayLabels(locale = "en") {
  return DAY_LABELS_BY_LOCALE[locale] || DAY_LABELS_BY_LOCALE.en;
}
// Back-compat default export for any non-locale-aware caller.
export const DAY_LABELS = DAY_LABELS_BY_LOCALE.en;

export function pad(n) { return String(n).padStart(2, "0"); }

const AMPM = {
  en: { am: "am", pm: "pm" },
  ar: { am: "ص", pm: "م" },
};

export function fmtTime(h, m, locale = "en") {
  const { am, pm } = AMPM[locale] || AMPM.en;
  let hh = h % 12; if (hh === 0) hh = 12;
  return `${hh}:${pad(m)} ${h < 12 ? am : pm}`;
}

export function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function prettyDate(iso, locale = "en") {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    weekday: "short", day: "numeric", month: "short",
    calendar: "gregory", numberingSystem: "latn",
  });
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
export function slotsForDay(availability, locale = "en") {
  const { startH, endH, slotMinutes } = availability;
  const out = [];
  for (let mins = startH * 60; mins + slotMinutes <= endH * 60; mins += slotMinutes) {
    out.push({ h: Math.floor(mins / 60), m: mins % 60, label: fmtTime(Math.floor(mins / 60), mins % 60, locale) });
  }
  return out;
}

export function clampSlot(mins) {
  return Math.max(5, Math.min(60, mins));
}
