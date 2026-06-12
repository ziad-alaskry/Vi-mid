# Placeholders & future integrations

Everything below is intentionally stubbed in this demo and built to swap in cleanly.

## 1. Healthcare companion — source of truth
- File: `src/app/library/page.jsx` → `Companion`
- The opening message and every reply reference `[trusted source]`.
- Production: replace canned `setTimeout` reply with a call to the real endpoint and
  name the actual source in the first message.

## 2. Medical updates — content pipeline
- File: `src/app/library/page.jsx` → `UPDATES` array
- Production: feed populated by an admin or an n8n-hosted AI agent that fetches from
  defined trusted resources. Keep the same card shape `{ tag, title, source, time }`.

## 3. Partners — Jarir & eXtra
- File: `src/app/loyalty/page.jsx` → `PARTNERS` array
- Wordmarks are styled text placeholders, not official brand assets. Do not ship the
  real logos until the partnerships are signed and approved assets are provided.
- `url` fields point to the public storefronts.

## 4. Video — WebRTC
- File: `src/app/call/[id]/page.jsx`
- Uses `getUserMedia` for a local self-view only; the "remote" party is simulated.
- Production: add real two-party signalling (e.g. a WebRTC SFU / third-party SDK).
- Constraints already enforced in UI: 120s base, doctor-only extend, max 2 extensions.

## 5. Backend & auth
- File: `src/lib/store.jsx`
- All state is `localStorage`. Production: replace with API calls + real auth, keeping
  the same action surface (`book`, `cancelBooking`, `completeBooking`, `setAvailability`).
