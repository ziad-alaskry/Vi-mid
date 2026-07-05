# Placeholders & future integrations

Everything below is intentionally stubbed in this demo and built to swap in cleanly.

## Seams inventory

Each "prototype shortcut" sits behind a named seam so production is an upgrade, not a
rewrite. See `docs/implementation-Guide.md` for the phased roadmap.

| Seam | Interface | Demo impl | Production swap |
|---|---|---|---|
| **DataProvider** | `src/lib/data/` (`operations`, `load`/`persist`/`clear`) | `localStorageProvider` | API-backed provider (Phase 8) |
| **CallProvider** | `src/lib/call/index.js` (`connect`/`disconnect`) | local camera self-view, simulated peer | real two-party WebRTC/SDK |
| **ContentProvider** | `src/lib/content/index.js` (`getUpdates`/`getCompanionReply`) | canned replies / static feed | admin- or agent-fed trusted sources |

All state flows through **DataProvider** — no component touches `localStorage` directly.
The call room and Library page only ever call `callProvider`/`contentProvider` — never
`getUserMedia` or the mock content directly — so swapping either integration is a
single-file change with no page/component edits.

## 1. Healthcare companion — source of truth
- Files: `src/lib/content/index.js` (`getCompanionReply`), `src/app/[locale]/library/page.jsx` → `Companion`
- The opening message and every reply reference `[trusted source]`.
- Production: replace `getCompanionReply`'s body with a call to the real endpoint and
  name the actual source in the first message (`library.companionGreeting` in
  `src/messages/{ar,en}.json`).

## 2. Medical updates — content pipeline
- Files: `src/lib/content/index.js` (`getUpdates`), `src/messages/{ar,en}.json` → `library.updates`
- Production: replace `getUpdates`'s body with a fetch from an admin- or n8n-hosted AI
  agent endpoint that fetches from defined trusted resources. Keep the same card shape
  `{ tag, tone, title, source, time }`.

## 3. Video — WebRTC
- Files: `src/lib/call/index.js` (`connect`/`disconnect`), `src/app/[locale]/call/[id]/page.jsx`
- Uses `getUserMedia` for a local self-view only; the "remote" party is simulated.
- Production: replace `connect`/`disconnect`'s bodies with real two-party signalling
  (e.g. a WebRTC SFU / third-party SDK) — no changes to the call room's timer,
  extend-prompt, or rating logic.
- Constraints already enforced in UI: 120s base, HCP-only extend prompt (shown at most
  twice), max 2 extensions (240s ceiling).

## 4. Backend & auth
- Files: `src/lib/data/` (persistence + operations), `src/lib/store.jsx` (thin React binding).
- All state flows through the **DataProvider** seam; `localStorageProvider` is the demo impl.
  Production: add an API-backed provider implementing the same surface (`load`/`persist`/`clear`
  + `operations`: `login`, `logout`, `book`, `rescheduleBooking`, `updateBooking`,
  `cancelBooking`, `completeBooking`, `setAvailability`, `trackSurveyClick`, `reset`) and
  swap the export in `src/lib/data/index.js` — no page or component changes. Add real auth
  in place of the persona picker.

## 5. Feedback survey links
- File: `src/lib/config.js` → `SURVEY.urlHcp`/`urlRep` (placeholders, env-overridable via
  `NEXT_PUBLIC_SURVEY_URL_HCP`/`_REP`).
- Click tracking goes through `trackSurveyClick` (local counter today; production wires
  this to `POST /api/feedback/click`). Counts surface on the admin dashboard
  (`src/app/[locale]/admin/page.jsx`).
- Production: replace the placeholder URLs with real Typeform/Google Forms links.

## 6. Admin metrics
- File: `src/app/[locale]/admin/page.jsx`
- All KPIs are computed client-side from `state.bookings` in the current browser only —
  there is no cross-session/cross-user aggregation in this demo.
- Production: replace the `useMemo` computation with a real `GET /api/admin/metrics` call
  aggregating across all users/sessions.
