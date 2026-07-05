# ViMed — Implementation Guide (Development Roadmap)

> **Role:** Software architect. **Goal:** turn the current demo into a **high-quality,
> production-track demo**, then flip to real infrastructure in one contained phase once a
> deployment environment is chosen.

## Context

The shipped repo is a **single front-end-only Next.js 14 app** (App Router, Tailwind,
plain JS), with **all state in `localStorage`** via `src/lib/store.jsx`. It is *not* the
TS pnpm/Turborepo monorepo described in the other `docs/` files — those are the aspirational
production architecture. Rather than rewrite, we **harden the current app and isolate every
"prototype shortcut" behind a seam**, so the documented backend becomes an *upgrade*, not
a redo (per the docs' ADR philosophy).

**Confirmed strategy decisions**
- **Codebase:** keep the single JS app; refactor `localStorage` behind a swappable
  **data-access layer**. Stays JS.
- **i18n/RTL:** land **now** — Arabic default + English toggle, full RTL.
- **Backend:** **deferred** to one clearly-scoped phase; demo stays client-side, all
  swaps sit behind the data seam.

## Guiding principles (cross-cutting, every phase)
- **One data surface.** All reads/writes go through `src/lib/data/*` — no component or page
  touches `localStorage` directly. The action surface (`book`, `cancelBooking`,
  `completeBooking`, `setAvailability`, directory/session queries) is the contract the
  future API implements verbatim.
- **Seams over shortcuts.** Simulated pieces (video call, companion chat, updates feed) live
  behind named provider interfaces (`CallProvider`, `ContentProvider`).
- **Tokens & strings, never literals.** No raw hex in components (Scrub theme tokens); no
  hardcoded UI strings (i18n catalogues). No physical `left/right` — logical properties only.
- **Role-gated by design.** Every screen/action respects `hcp | rep | admin`.

---

## Domain → phase map

| Domain | Phases |
|---|---|
| Architecture & data seam | 0 |
| Product feature changes (the current vision) | 1 |
| i18n / RTL | 2 |
| Design system & responsive shell | 3 |
| Core flow hardening | 4 |
| Content & integration seams | 5 |
| Admin & feedback instrumentation | 6 |
| QA / a11y / performance | 7 |
| Production cutover (deferred) | 8 |

Each phase is independently implementable by the coding agent, ends with a **DoD**, and is
committed with conventional commits.

---

## Phase 0 — Architecture & data seam
**Why first:** everything downstream depends on a single, swappable data contract.
- Create `src/lib/data/` with a `DataProvider` contract and a `localStorageProvider`
  implementation. Move all mutation/query logic out of `src/lib/store.jsx`; leave
  `store.jsx` as the thin React binding (context + hooks) delegating to the provider.
- Centralize constants in `src/lib/config.js` (call `BASE_SECONDS`, `MAX_EXTENSIONS`,
  extend-prompt threshold; feature flags). Reserve `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL`
  placeholders (unused now) for the future API adapter.
- Inventory seams in `PLACEHOLDERS.md`: `DataProvider`, `CallProvider`, `ContentProvider`.

**DoD:** app behaves identically; a repo-wide search finds no `localStorage` usage outside
`src/lib/data/`; the provider contract is documented.

## Phase 1 — Product feature changes (the current vision)
1. **Remove Loyalty entirely** — delete `src/app/loyalty/`, remove the tab from
   `src/components/TabBar.jsx` (grid `cols-5`→`cols-4`) and `TAB_ROUTES` in
   `src/components/AppChrome.jsx`; drop `loyaltyPoints` + the `+15` award in the data layer;
   reword Profile reset copy (`src/app/profile/page.jsx`). Partner offers go with it (also
   remove the Partners seam/section). Update `README.md` / `PLACEHOLDERS.md`.
2. **Extend +60s → prompt, HCP-only, at most twice** — in `src/app/call/[id]/page.jsx`,
   replace the always-visible button with a time-triggered prompt (opens when `seconds`
   crosses a low threshold while `isHcp && extensions < 2 && promptsShown < 2`); **Extend
   +60s** calls existing `extend()`, **No thanks** dismisses; cap appearances at 2.
3. **Cancel/End call for both roles** — verify the in-call end control is not role-gated
   (it already isn't); clarify its `aria-label`. No change to list-level cancel.

**DoD:** no Loyalty anywhere; nav evenly spaced; HCP sees the extend prompt at most twice
and reps never; both roles can end a call → rating; points logic fully gone.

## Phase 2 — i18n & RTL
- Add **next-intl**, locales `['ar','en']`, `defaultLocale: 'ar'`, locale-prefixed routing;
  set `<html lang dir>` (`rtl` for ar). Arabic/Latin fonts via `next/font` (Cairo/Tajawal +
  Inter). `LanguageSwitcher` in the shell.
- Extract every visible string into `messages/ar.json` + `messages/en.json`.
- **Logical-CSS audit:** replace physical `left/right`, `top-4 right-4`, `ml-/mr-`, etc.
  (e.g. the call self-view and countdown positioning) with logical equivalents so layout
  mirrors automatically.

**DoD:** every screen mirrors correctly in `ar`; toggle works and persists; no physical
left/right remain; no hardcoded UI strings.

## Phase 3 — Design system & responsive shell
- Token/theme audit (Scrub palette in `tailwind.config.js` + `globals.css`); zero raw hex in
  components. Consolidate shared primitives in `src/components/ui.jsx` (Button, Input,
  Select, Card, Badge, Dialog/Sheet, Tabs, Avatar, Stars, EmptyState, Toast) and reuse them
  everywhere. Standardize loading / empty / error states.
- **Responsive:** mobile-first bottom nav becomes a **desktop side rail**; content max-width
  and grid scale up to tablet/desktop.

**DoD:** one consistent component set reused across screens; usable mobile→desktop; visible
loading/empty/error everywhere.

## Phase 4 — Core flow hardening
- **Directory / New visit:** city/sector/specialty filters + name/centre search +
  pagination; HCP profile sheet with slot picker; taken slots disabled.
- **Availability (HCP):** duty days/hours, fixed-weekly, configurable slot length, correct
  slot generation (`src/lib/slots.js`).
- **Visits:** upcoming/history, cancel, reschedule, start-call; **double-booking guard** in
  the data layer (atomic-style check now, mirrors the future DB guard).
- **Call + rating:** countdown, extend prompt, mutual 5-star + comment persisting and
  surfacing on profiles.

**DoD:** each flow handles empty/duplicate/edge inputs without breakage; ratings persist and
display; no double-bookings.

## Phase 5 — Content & integration seams (mock, swappable)
- **Companion chatbot** and **Medical updates** behind a `ContentProvider` (mock impl now,
  stable card/message shapes) — `src/app/library/page.jsx`.
- **Video** behind a `CallProvider` interface (local self-view now; real two-party WebRTC
  later) — `src/app/call/[id]/page.jsx`.

**DoD:** each integration is reachable only through its interface; swapping to a real
source/SDK is a single-file change.

## Phase 6 — Admin & feedback instrumentation (demo-level)
- Admin persona + lightweight metrics computed client-side over demo data (visits
  booked/completed, completion rate, avg mutual rating, active users by role/city/specialty).
- Survey-link CTA surfaced contextually to testers; click tracking recorded through the data
  layer (local counter now → API later).

**DoD:** admin sees live demo metrics; survey CTA appears and clicks are counted.

## Phase 7 — QA, accessibility & performance
- QA matrix across roles; RTL/LTR parity on every screen; mobile→desktop responsiveness;
  empty/error states; a11y (focus order, labels, contrast, tap targets); perf pass
  (bundle/image/route); add error boundaries.

**DoD:** QA checklist green; no critical a11y/perf regressions; demo is stakeholder-ready.

## Phase 8 — Production cutover (DEFERRED — trigger once deployment env is chosen)
- Realize the docs' backend: stand up `apps/api` (Express + MongoDB + Socket.IO + JWT auth)
  **or** the chosen managed stack. Implement an **API `DataProvider`** matching the Phase-0
  contract; replace the persona picker with real auth; add realtime visit updates; wire
  env/secrets; deploy web + api.
- Because all data/content/call access already flows through seams, this phase is additive —
  no feature rewrites.

**DoD:** fresh environment → real accounts → live persisted data with realtime updates.

---

## Verification (per phase, `npm run dev` → http://localhost:3000)
- **Every phase:** app builds and runs; targeted manual walkthrough of the affected flow as
  each relevant role (rep / HCP / admin); no console errors.
- **Phase-specific gates** are the DoD lines above. Recommended smoke path after any phase:
  login as rep → book a visit → login as HCP → see it → start call → extend prompt → end →
  rate → verify on both profiles.

## Suggested execution order
`0 (seam)` → `1 (feature changes)` → `2 (i18n/RTL)` → `3 (design system)` →
`4 (core flows)` → `5 (integration seams)` → `6 (admin/feedback)` → `7 (QA)` →
`8 (production, on deployment decision)`.
