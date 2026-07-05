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

export const initialState = {
  currentUserId: null,
  bookings: [],              // {id, hcpId, repId, date, time, durationMin, product, company, status, hcpRating, repRating, repComment, hcpComment}
  availabilityOverrides: {}, // hcpId -> availability object (when an HCP edits their own)
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

  reset: () => ({ ...initialState }),
};
