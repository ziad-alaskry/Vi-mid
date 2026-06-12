# ViMed — MVP demo

Front-end-only Next.js demo connecting healthcare professionals (HCPs) with pharma
sales reps via pre-scheduled, short video visits. Built to validate concept appeal,
core flows, and Saudi-market fit through surveys and hands-on testing.

Theme: **A · Scrub** (surgeon-gown green, clinical blue, white).

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build & deploy (Vercel)

```bash
npm run build
```

Push the repo to GitHub and import it in Vercel — no environment variables needed.
The app is fully client-side; all state lives in the browser via `localStorage`.

## How the demo works

- **Single deployed link with a persona picker.** The login screen lets a tester
  sign in as a seeded Rep or as an HCP (physician / pharmacist / purchaser).
- **Role-aware navigation.** The centre tab ("New visit") shows the rep discovery +
  booking flow for reps, and the configurable availability editor for HCPs.
- **Persistence.** Bookings, ratings, availability edits, and loyalty points survive
  refresh. Reset from Profile → "Reset demo data".

## Implemented features

- Persona-picker login (no real auth)
- Bottom tab shell: Visits · New visit (centre) · Library · Loyalty · Profile
- **Visits** — upcoming / history, cancel, reschedule, start call
- **New visit (rep)** — territory / sector / specialty filters, name + centre search,
  profile sheet, slot booking (taken slots disabled)
- **Availability (HCP)** — duty days, duty hours, fixed-weekly repeat, and a
  configurable slot length defaulting to 15 min with −5 / +5 steppers (floor 5,
  ceiling 60); slots auto-generate
- **Video call** — camera self-view, 120-second countdown ring, mute/end; a
  doctor-only "Extend +60s" control usable exactly twice (caps the call at 240s)
- **Mutual rating** — 5-star + comment after each call
- **Library** — Updates feed, Treatment library (disease cards + prominent search),
  and a Healthcare companion chat shell
- **Loyalty** — points tracker + Jarir / eXtra partner offers (no leaderboard)
- **Profile** — info, rating received, sign out, reset

## Mock data

`src/data/directory.json` — 100 physicians (10 × 10 specialties), 30 pharmacists,
10 purchasers, 10 reps. Arabic personal names; English centre and city names across
Jeddah, Riyadh, and Dammam. Regenerate with `node gen-data.js`.

## Stubs to swap for production (see PLACEHOLDERS.md)

- Companion chatbot opens with a `[trusted source]` placeholder
- Medical-updates feed is mock content (admin / n8n AI agent later)
- Jarir & eXtra appear as placeholder partner cards
- Camera self-view stands in for real two-party WebRTC
- `localStorage` stands in for a real backend and authenticated accounts

## Stack

Next.js 14 (App Router) · React 18 · Tailwind CSS. No backend.
