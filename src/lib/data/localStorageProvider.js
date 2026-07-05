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

// ---- Operations: pure (state, ...args) -> nextState ------------------------

export const operations = {
  login: (s, id) => ({ ...s, currentUserId: id }),

  logout: (s) => ({ ...s, currentUserId: null }),

  book: (s, payload) => {
    const id = `bk_${s.seq}`;
    const booking = { id, status: "upcoming", ...payload };
    return { ...s, seq: s.seq + 1, bookings: [...s.bookings, booking] };
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
