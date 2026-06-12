"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { personById } from "@/lib/seed";

const KEY = "vimed_state_v1";
const StoreCtx = createContext(null);

const initial = {
  currentUserId: null,
  bookings: [],          // {id, hcpId, repId, date, time, durationMin, product, company, status, hcpRating, repRating, repComment, hcpComment}
  availabilityOverrides: {}, // hcpId -> availability object (when an HCP edits their own)
  loyaltyPoints: 120,
  seq: 1,
};

function load() {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch { return initial; }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => { setState(load()); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, ready]);

  const login = useCallback((id) => setState((s) => ({ ...s, currentUserId: id })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, currentUserId: null })), []);

  const book = useCallback((payload) => {
    setState((s) => {
      const id = `bk_${s.seq}`;
      const booking = { id, status: "upcoming", ...payload };
      return { ...s, seq: s.seq + 1, bookings: [...s.bookings, booking] };
    });
  }, []);

  const updateBooking = useCallback((id, patch) => {
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, []);

  const cancelBooking = useCallback((id) => {
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)) }));
  }, []);

  const completeBooking = useCallback((id) => {
    setState((s) => ({
      ...s,
      loyaltyPoints: s.loyaltyPoints + 15,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: "done" } : b)),
    }));
  }, []);

  const setAvailability = useCallback((hcpId, availability) => {
    setState((s) => ({ ...s, availabilityOverrides: { ...s.availabilityOverrides, [hcpId]: availability } }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...initial });
    try { window.localStorage.removeItem(KEY); } catch {}
  }, []);

  const currentUser = state.currentUserId ? personById(state.currentUserId) : null;
  const isHcp = currentUser && ["Physician", "Pharmacist", "Purchaser"].includes(currentUser.role);
  const isRep = currentUser && ["MR", "KAM", "PS", "PM"].includes(currentUser.role);

  const value = {
    ready, state, currentUser, isHcp, isRep,
    login, logout, book, updateBooking, cancelBooking, completeBooking, setAvailability, reset,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
