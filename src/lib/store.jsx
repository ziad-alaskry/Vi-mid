"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { personById } from "@/lib/seed";
import { provider } from "@/lib/data";

// Thin React binding over the data provider. This module holds no persistence
// logic and no state-transition logic — both live in src/lib/data. It only:
//   - mirrors provider state into React,
//   - persists on change,
//   - exposes the action surface + derived session flags to the tree.
const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(provider.initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => { setState(provider.load()); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    provider.persist(state);
  }, [state, ready]);

  const { operations } = provider;

  const login = useCallback((id) => setState((s) => operations.login(s, id)), [operations]);
  const logout = useCallback(() => setState((s) => operations.logout(s)), [operations]);
  const book = useCallback((payload) => setState((s) => operations.book(s, payload)), [operations]);
  const updateBooking = useCallback((id, patch) => setState((s) => operations.updateBooking(s, id, patch)), [operations]);
  const cancelBooking = useCallback((id) => setState((s) => operations.cancelBooking(s, id)), [operations]);
  const completeBooking = useCallback((id) => setState((s) => operations.completeBooking(s, id)), [operations]);
  const setAvailability = useCallback((hcpId, availability) => setState((s) => operations.setAvailability(s, hcpId, availability)), [operations]);
  const reset = useCallback(() => { setState(operations.reset()); provider.clear(); }, [operations]);

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
