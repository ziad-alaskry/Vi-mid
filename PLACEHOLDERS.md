# Placeholders & future integrations

Everything below is intentionally stubbed in this demo and built to swap in cleanly.

## Seams inventory

Each "prototype shortcut" sits behind a named seam so production is an upgrade, not a
rewrite. See `docs/implementation-Guide.md` for the phased roadmap.

| Seam | Interface / location | Demo impl | Production swap |
|---|---|---|---|
| **DataProvider** | `src/lib/data/` (`operations`, `load`/`persist`/`clear`) | `localStorageProvider` | API-backed provider (Phase 8) |
| **CallProvider** | `src/app/call/[id]/page.jsx` | local camera self-view, simulated peer | real two-party WebRTC/SDK |
| **ContentProvider** | `src/app/library/page.jsx` (companion + updates) | canned replies / mock feed | admin- or agent-fed trusted sources |

All state flows through **DataProvider** — no component touches `localStorage` directly.

## 1. Healthcare companion — source of truth
- File: `src/app/library/page.jsx` → `Companion`
- The opening message and every reply reference `[trusted source]`.
- Production: replace canned `setTimeout` reply with a call to the real endpoint and
  name the actual source in the first message.

## 2. Medical updates — content pipeline
- File: `src/app/library/page.jsx` → `UPDATES` array
- Production: feed populated by an admin or an n8n-hosted AI agent that fetches from
  defined trusted resources. Keep the same card shape `{ tag, title, source, time }`.

## 3. Video — WebRTC
- File: `src/app/call/[id]/page.jsx`
- Uses `getUserMedia` for a local self-view only; the "remote" party is simulated.
- Production: add real two-party signalling (e.g. a WebRTC SFU / third-party SDK).
- Constraints already enforced in UI: 120s base, HCP-only extend prompt (shown at most
  twice), max 2 extensions (240s ceiling).

## 4. Backend & auth
- Files: `src/lib/data/` (persistence + operations), `src/lib/store.jsx` (thin React binding).
- All state flows through the **DataProvider** seam; `localStorageProvider` is the demo impl.
  Production: add an API-backed provider implementing the same surface (`load`/`persist`/`clear`
  + `operations`: `login`, `logout`, `book`, `updateBooking`, `cancelBooking`,
  `completeBooking`, `setAvailability`, `reset`) and swap the export in `src/lib/data/index.js`
  — no page or component changes. Add real auth in place of the persona picker.
