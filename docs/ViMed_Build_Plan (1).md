# ViMed — Build Plan (Claude Code Handoff)

> **Audience:** Claude Code (and any engineer executing the build).
> **Goal:** Stand up a maintainable, scalable, bilingual **web** prototype of ViMed for user testing & feedback.
> **Companion docs:** `ViMed_Project_Compass.pdf` (business/product) · `ViMed_Architecture_and_Decisions.md` (engineering rationale).

This document is **executable and ordered**. Do the phases in sequence. Each phase ends with a **Definition of Done (DoD)** — do not advance until it passes. Phase 0 (environment) comes first and must be fully green before any feature code.

---

## 0. Ground rules for the build

1. **Stack is fixed:** Next.js (App Router) + Express + MongoDB, TypeScript everywhere, in a **pnpm + Turborepo monorepo**.
2. **Prototype, not production** — but built behind clean seams so simulated pieces (video call, content feeds) upgrade later without rewrites.
3. **Bilingual from day one:** Arabic is the **default** locale; English is a toggle. Full **RTL** behaviour, not just translated strings.
4. **Mobile-first** responsive; scale up to tablet/desktop.
5. **Three roles:** `hcp`, `sales_rep`, `admin`. Every route and API is role-gated.
6. **Auth:** real **JWT (email + password)** with seeded demo accounts. No OTP.
7. **Deployment target for now:** local/dev only. Keep all secrets in `.env`; never hardcode.
8. **Theme:** "Soft Care" — sage `#6FA287`, aqua `#9AD0DD`, warm white `#FBFAF6`. Tokens defined once, consumed everywhere.
9. Commit per logical step with conventional commits. Keep PRs/phases reviewable.

---

## Target monorepo layout

```
vimed/
├─ apps/
│  ├─ web/                 # Next.js 14 (App Router, TS)
│  └─ api/                 # Express + TS
├─ packages/
│  ├─ shared/              # Shared TS types + Zod schemas (single source of truth)
│  ├─ config/             # Shared tsconfig / eslint / prettier
│  └─ i18n/                # Locale message catalogues (ar, en) shared if needed
├─ docker-compose.yml      # Local MongoDB (+ mongo-express optional)
├─ turbo.json
├─ pnpm-workspace.yaml
├─ package.json            # root scripts
├─ .env.example            # documented; real .env files are gitignored
├─ .gitignore
└─ README.md
```

---

## Phase 0 — Environment & project scaffolding  *(do this first)*

**Objective:** a running, lint-clean, type-checked empty monorepo with local MongoDB, shared config, theme tokens, and i18n/RTL scaffolding — before any feature.

### 0.1 Prerequisites (verify, don't assume)
```bash
node -v      # require Node 20 LTS (use nvm/volta if missing)
corepack enable && corepack prepare pnpm@latest --activate
pnpm -v      # require pnpm 9+
docker -v    # for local MongoDB (or a local mongod install)
git --version
```

### 0.2 Initialise the monorepo
```bash
mkdir vimed && cd vimed
git init
pnpm init
# pnpm workspaces
printf 'packages:\n  - "apps/*"\n  - "packages/*"\n' > pnpm-workspace.yaml
pnpm add -D -w turbo typescript @types/node tsx eslint prettier
```
Create `turbo.json` with pipelines for `dev`, `build`, `lint`, `typecheck`, `test`.
Add root `package.json` scripts: `dev`, `build`, `lint`, `typecheck`, `seed`, `db:up`, `db:down`.

### 0.3 Shared config package
- `packages/config`: base `tsconfig.base.json` (strict: true), shared `eslint` config, `prettier` config.
- `packages/shared`: `package.json`, `tsconfig` extending base, `src/index.ts` exporting **types + Zod schemas** (start empty; filled in Phase 1).

### 0.4 Local database
Create `docker-compose.yml`:
```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
volumes: { mongo_data: {} }
```
```bash
docker compose up -d   # exposes mongodb://localhost:27017
```

### 0.5 Backend skeleton (`apps/api`)
```bash
cd apps/api && pnpm init
pnpm add express mongoose jsonwebtoken bcryptjs zod helmet cors cookie-parser pino pino-http socket.io dotenv express-rate-limit
pnpm add -D typescript tsx @types/express @types/jsonwebtoken @types/bcryptjs @types/cors @types/cookie-parser @types/node vitest supertest
```
- `src/index.ts`: boot Express, helmet, cors (from `CORS_ORIGIN`), json parser, pino-http, health route `GET /api/health` → `{ ok: true }`, central error handler.
- `src/config/env.ts`: load + **validate `.env` with Zod**; fail fast on missing vars.
- `src/db/connect.ts`: Mongoose connect with retry + log.
- Wire a Socket.IO server onto the same HTTP server (no events yet).

### 0.6 Frontend skeleton (`apps/web`)
```bash
cd ../../apps/web
pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack
pnpm add next-intl @tanstack/react-query zustand socket.io-client react-hook-form @hookform/resolvers zod axios lucide-react
pnpm add -D @types/node
# shadcn/ui (Radix-based primitives)
pnpm dlx shadcn@latest init   # choose CSS variables; map to Soft Care tokens
```

### 0.7 Theme tokens (Soft Care) — define once
In `apps/web` global CSS / Tailwind config, define CSS variables and Tailwind colors:
```css
:root{
  --primary:#6FA287; --primary-dark:#557C68; --primary-light:#A7C6B5;
  --accent:#9AD0DD; --accent-dark:#6FB3C4;
  --bg:#FBFAF6; --surface:#FFFFFF; --ink:#2B3A33; --muted:#6B7C74; --line:#E3E7E1;
  --success:#4E9A6B; --warning:#C9853F; --danger:#C0635E;
  --radius:14px;
}
```
Map these into `tailwind.config` `theme.extend.colors` so classes like `bg-primary`, `text-ink` work. **No hardcoded hex in components.**

### 0.8 i18n + RTL scaffolding
- Configure **next-intl** with locales `['ar','en']`, `defaultLocale: 'ar'`, locale-prefixed routing (`/ar/...`, `/en/...`).
- Set `<html lang dir>` dynamically: `dir="rtl"` for `ar`, `ltr` for `en`.
- Add Arabic-first fonts (e.g. **Cairo/Tajawal** for Arabic, **Inter** for Latin) via `next/font`.
- Use **CSS logical properties** (`margin-inline-start`, `padding-inline`, `start/end`) and Tailwind logical utilities so layout mirrors automatically. Avoid `left/right`.
- Create `packages/i18n` (or `apps/web/messages`) with `ar.json` and `en.json` holding a few starter keys; a `LanguageSwitcher` component toggles locale.

### 0.9 ✅ Phase 0 DoD
- `pnpm dev` runs **web** (`:3000`) and **api** (`:4000`) together via Turbo.
- `GET http://localhost:4000/api/health` → `{ ok: true }`.
- MongoDB reachable; api logs a successful connection.
- Visiting `/` redirects to `/ar` (RTL, Arabic) and `/en` works (LTR).
- `pnpm lint` and `pnpm typecheck` are clean across the workspace.
- `.env.example` documents every variable (see §A).

---

## Phase 1 — Domain model, shared types & auth

**Objective:** the data spine + working JWT auth + seedable demo accounts.

1. **Shared schemas (`packages/shared`):** Zod schemas + inferred TS types for `User`, `HcpProfile`, `SalesRepProfile`, `Center`, `Availability`, `Slot`, `Visit`, `Rating`, `LibraryItem`, `LoyaltyTxn`, `Offer`, `SurveyLink`, `Notification`. These are the single source of truth for both apps. (Full field list in the Architecture doc, "Data Model".)
2. **Mongoose models (`apps/api/src/models`)** mirroring the shared schemas. Use a **discriminator** on `User` (`role`) or separate profile collections keyed by `userId` — see Architecture ADR-006.
3. **Auth:**
   - `POST /api/auth/register` (role-specific payloads, validated by Zod), `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
   - Hash with bcrypt. Issue short-lived **access JWT** + longer **refresh JWT** (httpOnly cookie). Verify middleware (`requireAuth`) + `requireRole(...roles)`.
4. **Frontend auth:** sign-in / sign-up pages (HCP path & Rep path), RHF + Zod, TanStack Query mutation, store session in memory + refresh cookie; a `useAuth` hook + route guards (server components check session; client guards redirect).

**DoD:** can register & log in as each role; protected route returns 401 without token; `/api/auth/me` returns the right role; tokens refresh.

---

## Phase 2 — App shell, navigation & layouts

**Objective:** the responsive, RTL-correct authenticated shell.

1. **App shell:** mobile-first bottom nav (Visits · New Visit/Availability · Library · Loyalty · Profile) that becomes a side rail on desktop. Center action is **New Visit** for reps, **Availability** for HCPs.
2. **Layouts:** `(public)` layout (auth pages) and `(app)` layout (authenticated shell); separate `(admin)` layout. Role decides which nav items render.
3. **Shared UI:** build core components on shadcn/Radix — Button, Input, Select, Card, Dialog, Tabs, Calendar, StarRating, Avatar, EmptyState, Toast — all theme-token driven and RTL-safe.
4. **Loading/empty/error states** standardised.

**DoD:** logging in lands each role on its correct home; nav reflects role; everything mirrors correctly in `ar`; identical components reused across screens.

---

## Phase 3 — Directory & New Visit (Sales Rep)

1. `GET /api/directory` with filters (`city`, `sector`, `centerId`, `specialty`) + search (`q` over name/center) + pagination.
2. `GET /api/hcp/:id` profile with available slots.
3. Frontend: New Visit screen with filter controls (dropdowns, no maps), search bar, results list, HCP profile page with a slot picker.

**DoD:** rep can filter/search the seeded directory and view any HCP's open slots.

---

## Phase 4 — Availability & scheduling (HCP)

1. `POST/PUT /api/availability` — duty days + per-day start/end hours + `fixedWeekly`. Server **generates 15-minute slots** from hours.
2. `GET /api/availability/me` and slot listing; month/day calendar views on the client.
3. Slot lifecycle: `available` → `booked` (atomic guard against double-booking).

**DoD:** HCP publishes availability, slots generate correctly, "fixed weekly" repeats; slots show up in the rep's directory view.

---

## Phase 5 — Visits + real-time

1. `POST /api/visits` (rep books a slot), `GET /api/visits?status=upcoming|history`, `PATCH /api/visits/:id` (reschedule/cancel — rep).
2. **Socket.IO:** authenticated sockets (JWT handshake), per-user rooms. Emit `visit:created`, `visit:updated`, `visit:reminder`, `notification:new`. Web subscribes and updates TanStack Query caches live + toasts.
3. Upcoming/History UI with Visit Detail (rep sees reschedule/cancel/start-call).

**DoD:** booking a slot instantly appears for the HCP (no refresh); reschedule/cancel sync both ways; reminders fire.

---

## Phase 6 — Simulated video call + rating

1. **Call room** (`/call/:visitId`): request local camera (`getUserMedia`), show self-view, run a **120-second countdown**, auto-end. **No remote peer / no WebRTC** — isolate all of this behind a `CallProvider` interface so real WebRTC can drop in later (ADR-004).
2. On end → **post-call rating**: both parties give 5 stars + comment. `POST /api/visits/:id/rating`. Update each user's `ratingAvg`/`ratingCount` and award **loyalty points**.

**DoD:** start call → countdown → rating screen → ratings persist and show on profiles; points awarded.

---

## Phase 7 — Library

1. `GET /api/library?type=update|protocol&specialty=&q=` over **mock seeded content** (bilingual titles).
2. Two sub-views: **Medical Updates** and **Treatment Library** (search + specialty/diagnosis filters).

**DoD:** both sections render, search & filters work, content is bilingual.

---

## Phase 8 — Loyalty & leaderboard

1. `GET /api/loyalty/me` (points + history), `GET /api/loyalty/offers`, `GET /api/loyalty/leaderboard`.
2. UI: points tracker, redeemable offers list, leaderboard. Points already accrue from Phase 6.

**DoD:** points reflect completed visits; leaderboard ranks correctly; offers list renders.

---

## Phase 9 — Admin dashboard & feedback

1. `GET /api/admin/metrics` — visits booked/completed, completion rate, avg mutual rating, active users by role/city/specialty, leaderboard snapshot, survey click counts. (Role-gated to `admin`.)
2. `GET/POST /api/admin/survey-links`; public `POST /api/feedback/click` to track survey link clicks.
3. Admin UI: KPI cards + simple charts (e.g. Recharts), survey-link manager. Survey links also surfaced contextually to testers in the app.

**DoD:** admin sees live metrics; survey links appear to testers and clicks are tracked.

---

## Phase 10 — Seed data, polish & QA

1. **Seed script (`apps/api/src/seed`)** generating the mock directory: **100 physicians** (10 × 10 specialties), **30 pharmacists** (retail + hospital), **10 purchasers**, plus reps — **Arabic names**, English centre/city names, random centre/city/sector assignment, sample availability, library content, offers, and **demo accounts** (one per role) with a known password from `SEED_DEMO_PASSWORD`. Run via `pnpm seed`.
2. **i18n completeness pass:** every visible string keyed in `ar` + `en`; verify RTL mirroring on every screen.
3. **QA checklist:** auth per role, RBAC on every endpoint, booking race condition, RTL/LTR parity, mobile→desktop responsiveness, empty/error states, accessibility basics (focus, labels, contrast, tap targets).
4. **README:** quickstart, demo credentials, scripts, env setup.

**DoD:** fresh clone → `.env` from example → `pnpm i && pnpm db:up && pnpm seed && pnpm dev` → fully usable bilingual app with demo logins.

---

## A. `.env` requirements

> Provide `.env.example` at the root and per app. Real `.env*` are gitignored. Validate at boot with Zod (`apps/api/src/config/env.ts`).

### `apps/api/.env`
```ini
NODE_ENV=development
PORT=4000
# Database
MONGODB_URI=mongodb://localhost:27017/vimed
# Auth (generate strong random values, e.g. `openssl rand -hex 32`)
JWT_ACCESS_SECRET=replace-with-random-32+chars
JWT_REFRESH_SECRET=replace-with-different-random-32+chars
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
BCRYPT_ROUNDS=10
# CORS / client
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
# Logging & seeding
LOG_LEVEL=info
SEED_DEMO_PASSWORD=Demo1234!
```

### `apps/web/.env.local`
```ini
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=ViMed
NEXT_PUBLIC_DEFAULT_LOCALE=ar
# External survey links (placeholders — replace with real Typeform/Google Forms URLs)
NEXT_PUBLIC_SURVEY_URL_HCP=https://example.com/survey-hcp
NEXT_PUBLIC_SURVEY_URL_REP=https://example.com/survey-rep
```

> **Future (not in this prototype):** `LIVEKIT_*` / `TWILIO_*` (real calls), SMTP vars (email verify), SMS provider (OTP), cloud `MONGODB_URI` (Atlas). Reserve the names now.

---

## B. Technology stack & dependencies

### Frontend (`apps/web`)
| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS + CSS variables (Soft Care tokens) |
| UI primitives | shadcn/ui (Radix) |
| i18n / RTL | next-intl + CSS logical properties |
| Server state | TanStack Query |
| Client state | Zustand (light) |
| Forms | React Hook Form + Zod |
| Realtime | socket.io-client |
| HTTP | axios (with auth interceptor) |
| Icons | lucide-react |
| Charts (admin) | Recharts |

### Backend (`apps/api`)
| Concern | Choice |
|---|---|
| Runtime | Node 20 LTS |
| Framework | Express + TypeScript |
| ODM | Mongoose (MongoDB 7) |
| Auth | jsonwebtoken + bcryptjs |
| Validation | Zod (shared) |
| Realtime | Socket.IO |
| Security | helmet, cors, express-rate-limit, cookie-parser |
| Logging | pino + pino-http |
| Config | dotenv + Zod validation |

### Tooling (root)
pnpm (workspaces) · Turborepo · TypeScript (strict) · ESLint · Prettier · Vitest + Supertest · Docker Compose (local Mongo) · Husky + lint-staged (optional pre-commit).

### Dev vs production dependencies (rule of thumb)
- **dependencies:** anything imported by runtime code (express, mongoose, next, react, socket.io, zod, jsonwebtoken, bcryptjs, axios, etc.).
- **devDependencies:** types (`@types/*`), `typescript`, `tsx`, linters/formatters, test tooling, `turbo`, build-only helpers.

---

## C. Suggested build order summary
`Phase 0 (env)` → `1 (model+auth)` → `2 (shell)` → `3 (directory)` → `4 (availability)` → `5 (visits+realtime)` → `6 (call+rating)` → `7 (library)` → `8 (loyalty)` → `9 (admin)` → `10 (seed+polish+QA)`.

Keep every simulated capability behind an interface; keep all strings in i18n catalogues; keep all colours in tokens. That's what makes this prototype cheap to evolve into the pilot.
