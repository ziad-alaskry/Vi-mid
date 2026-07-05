// Active data provider for the demo.
//
// All persistence and state transitions live behind this module — no page or
// component touches localStorage directly. To move to a real backend (Phase 8),
// swap the import below for an API-backed provider that implements the same
// surface (`load`, `persist`, `clear`, `initialState`, `operations`).
// See docs/implementation-Guide.md.

import * as localStorageProvider from "./localStorageProvider";

export const provider = localStorageProvider;
