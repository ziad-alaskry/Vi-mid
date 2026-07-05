// localStorage implementation of the DataProvider contract.
//
// This is the ONLY module in the app that touches window.localStorage.
// It owns three concerns:
//   1. persistence  — load / persist / clear
//   2. initial state shape
//   3. operations   — pure state transitions (the swappable action surface)
//
// The future API-backed provider (Phase 8, see docs/implementation-Guide.md)
// implements the same `operations` names + `load`/`persist`/`clear` surface
// (returning Promises), so `src/lib/store.jsx` swaps providers without changing
// any page or component.

const KEY = "vimed_state_v1";

// N days from today, as "YYYY-MM-DD" (matches src/lib/slots.js's isoDate format).
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Demo seed bookings involving the 5 featured login personas (see
// src/lib/seed.js FEATURED_IDS) plus one extra rep for variety, so a fresh
// login already shows a populated Visits list, real profile ratings, and a
// non-zero admin dashboard instead of empty states everywhere. Ids use a
// "seed_" prefix so they can never collide with `bk_${seq}` ids the book()
// operation generates for real user bookings.
const SEED_BOOKINGS = [
  {
    id: "seed_bk_1", hcpId: "phy_1", repId: "rep_141", status: "upcoming",
    date: daysFromNow(3), time: "9:00 am", durationMin: 15,
    product: "Surgiclean Solution", company: "Sanofi",
  },
  {
    id: "seed_bk_2", hcpId: "pha_101", repId: "rep_141", status: "upcoming",
    date: daysFromNow(6), time: "10:00 am", durationMin: 15,
    product: "Surgiclean Solution", company: "Sanofi",
  },
  {
    id: "seed_bk_3", hcpId: "phy_1", repId: "rep_141", status: "done",
    date: daysFromNow(-10), time: "9:15 am", durationMin: 15,
    product: "Surgiclean Solution", company: "Sanofi",
    hcpRating: 4, hcpComment: "Good overview of the product, kept it brief.",
    repRating: 5, repComment: "Engaged well and asked sharp clinical questions.",
  },
  {
    id: "seed_bk_4", hcpId: "pur_131", repId: "rep_141", status: "cancelled",
    date: daysFromNow(-3), time: "9:00 am", durationMin: 15,
    product: "Surgiclean Solution", company: "Sanofi",
  },
  {
    id: "seed_bk_5", hcpId: "phy_1", repId: "rep_142", status: "done",
    date: daysFromNow(-20), time: "9:30 am", durationMin: 15,
    product: "Pulmoease Inhaler", company: "AstraZeneca",
    hcpRating: 5, hcpComment: "Clear answers on dosing, thanks.",
    repRating: 4, repComment: "Appreciated the time, ran a bit long.",
  },
  {
    id: "seed_bk_6", hcpId: "pha_101", repId: "rep_142", status: "done",
    date: daysFromNow(-15), time: "10:15 am", durationMin: 15,
    product: "Pulmoease Inhaler", company: "AstraZeneca",
    hcpRating: 5, hcpComment: "Useful comparison with current stock.",
    repRating: 5, repComment: "Very responsive, quick and productive visit.",
  },
];

export const initialState = {
  currentUserId: null,
  bookings: SEED_BOOKINGS,    // {id, hcpId, repId, date, time, durationMin, product, company, status, hcpRating, repRating, repComment, hcpComment}
  availabilityOverrides: {}, // hcpId -> availability object (when an HCP edits their own)
  surveyClicks: { hcp: 0, rep: 0 }, // feedback survey click-throughs, by audience
  seq: 1,
};

// ---- Persistence -----------------------------------------------------------

export function load() {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

export function persist(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function clear() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

// A slot ({hcpId, date, time}) is taken if another *upcoming* booking already
// holds it. Mirrors the atomic findOneAndUpdate guard the future DB-backed
// provider will use (see Architecture doc, "Booking a visit (race-safe)").
function isSlotTaken(bookings, { hcpId, date, time, excludeId }) {
  return bookings.some(
    (b) => b.id !== excludeId && b.hcpId === hcpId && b.date === date && b.time === time && b.status === "upcoming"
  );
}

// ---- Operations: pure (state, ...args) -> nextState ------------------------

export const operations = {
  login: (s, id) => ({ ...s, currentUserId: id }),

  logout: (s) => ({ ...s, currentUserId: null }),

  // Returns the unchanged state (no-op) if the slot is already booked; the
  // caller can tell success from failure by checking whether a booking with
  // the given hcpId/date/time now exists.
  book: (s, payload) => {
    if (isSlotTaken(s.bookings, { hcpId: payload.hcpId, date: payload.date, time: payload.time })) return s;
    const id = `bk_${s.seq}`;
    const booking = { id, status: "upcoming", ...payload };
    return { ...s, seq: s.seq + 1, bookings: [...s.bookings, booking] };
  },

  // Reschedules an existing booking to a new date/time, guarding against the
  // new slot already being held by a different upcoming booking for the same
  // HCP. No-op (unchanged state) on conflict.
  rescheduleBooking: (s, id, { date, time }) => {
    const booking = s.bookings.find((b) => b.id === id);
    if (!booking) return s;
    if (isSlotTaken(s.bookings, { hcpId: booking.hcpId, date, time, excludeId: id })) return s;
    return { ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, date, time } : b)) };
  },

  updateBooking: (s, id, patch) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  }),

  cancelBooking: (s, id) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
  }),

  completeBooking: (s, id) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "done" } : b)),
  }),

  setAvailability: (s, hcpId, availability) => ({
    ...s,
    availabilityOverrides: { ...s.availabilityOverrides, [hcpId]: availability },
  }),

  // Public feedback-link click tracking (mirrors the future POST /api/feedback/click).
  trackSurveyClick: (s, audience) => ({
    ...s,
    surveyClicks: { ...s.surveyClicks, [audience]: (s.surveyClicks[audience] || 0) + 1 },
  }),

  reset: () => ({ ...initialState }),
};
