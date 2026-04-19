# CLAUDE.md — SushiCloud Project Context

## Overview
SushiCloud is a personal music hosting web app. Audio files live in AWS S3 and stream directly to the browser via presigned URLs. The Express backend serves track/album metadata from Neon Postgres and generates short-lived S3 presigned URLs on demand — credentials never touch the client. Built incrementally; currently in active development past Phase 1.

---

## Hard Rules (non-negotiable)

| Rule | Detail |
|---|---|
| **Functional components only** | Never class components. Hooks throughout. |
| **Web Audio API first** | Before reaching for any third-party audio library, exhaust the Web Audio API. |
| **No secrets in client code** | Flag immediately if anything sensitive would land in `src/`. All secrets via env vars. |
| **DB is source of truth, not S3** | Store `s3_key` only. Never persist full S3 URLs — they expire. |
| **No `listeners` or `track_interactions` tables** | Deferred until Brainrot mode. Do not suggest them. |
| **Presigned URLs via query params** | `GET /api/tracks/url?key=...` — intentional. Express 5 wildcard routing breaks path params here. Do not change. |
| **TypeScript throughout** | No `.js` files in `src/` or `server/`. |
| **Drizzle ORM conventions only** | Never raw SQL strings. Always parameterized queries via Drizzle. |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| State | React Context + useReducer (`src/context/PlayerContext.tsx`) |
| Audio | HTML5 `<audio>` + Web Audio API (AudioContext, AnalyserNode, ChannelSplitterNode) |
| Visualizers | Canvas 2D (`VectorScope.tsx`), Three.js (`VectorScope3D.tsx`) |
| Backend | Node.js + Express 5 |
| Database | Neon Postgres (serverless) + Drizzle ORM |
| Storage | AWS S3 — presigned URL streaming |
| Package manager | pnpm |

---

## Infrastructure & Deployment

| Service | Role |
|---|---|
| **Netlify** | Frontend hosting (`pnpm build:client` → `vite build`) |
| **Railway** | Backend hosting (`pnpm start` → `tsx server/index.ts`) |
| **Neon** | Serverless Postgres (connection string via `DATABASE_URL` env var) |
| **AWS S3** | Audio file storage, `crossOrigin = 'anonymous'` required for Web Audio API CORS |
| **sushibot.cloud** | Domain (planned) |

**CORS:** Split by `NODE_ENV`. Dev allows `localhost:5173` + `*.ngrok-free.app` + `*.ngrok.io`. Prod reads `ALLOWED_ORIGIN` env var (set in Railway dashboard). See `server/index.ts`.

**Railway:** Binds to `0.0.0.0`, `app.set('trust proxy', 1)` required for accurate rate limiting behind Railway's proxy — **TODO: confirm this is set**.

**Frontend API base:** `src/lib/api.ts` exports `API_BASE = import.meta.env.VITE_API_URL ?? ''`. All fetch calls use this. `.env.development` = `http://localhost:3001`, `.env.production` = Railway URL.

---

## What's Already Shipped (do not rebuild)

**Playback**
- Track list fetched from DB, rendered with album header (title, song count, total duration)
- Click track → fetch presigned URL → stream from S3
- Play/pause, skip forward/back, seek bar, volume slider + mute
- Auto-advance to next track on end
- Spacebar shortcut for play/pause
- Player bar hidden on first load; appears after first track played (persisted in `localStorage`)
- Last played track restored from `localStorage` on page load
- iOS audio fix: `audio.play()` called before async fetch to preserve gesture context

**Visualizer**
- Full-screen visualizer view (slide-up overlay)
- Canvas 2D VectorScope: 128 radial frequency spikes with dot trails (`VectorScope.tsx`)
- Three.js 3D Fibonacci sphere visualizer with vertex colors (`VectorScope3D.tsx`)
- Web Audio API: stereo L/R split via `ChannelSplitterNode` + two `AnalyserNode` refs — lives in `App.tsx`, passed as props
- `createMediaElementSource` called once per audio element; persisted in `sourceRef`
- Mobile: Spotify-style full-screen player overlay with seek/skip controls

**Backend / DB**
- `GET /api/tracks` — published tracks from DB, 5-minute server-side in-memory cache
- `GET /api/tracks/url?key=` — presigned S3 URL (1hr expiry), key validated (no `..`, audio extensions only)
- `GET /api/albums` — non-archived albums
- `GET /api/albums/:id` — album + `trackCount` + `totalDurationMs` (computed via `SUM`/`COUNT`)
- `GET /api/health` — `SELECT 1` DB ping, returns `{ status, db }`
- Rate limiting: 100 req/15min general, 30 req/15min on `/api/tracks/url`
- `helmet` on all responses
- `express-rate-limit` on all routes

**DB Utilities**
- `pnpm seed "Album Name"` — seeds album + associates S3 tracks (`server/db/seed.ts`)
- `pnpm migrate` — runs Drizzle migrations
- `pnpm backfill:duration` — backfills `duration_ms` from S3 metadata for existing tracks

---

## On the Horizon (not started)

- **Three.js audio reactivity** — VectorScope3D reacting to live frequency data
- **Real-time audio FX** — Web Audio API effects chain (reverb, EQ, etc.)
- **Track version history** — schema + UI for managing multiple versions of a track
- **Brainrot mode** — `listeners` + `track_interactions` tables, play count analytics (deferred)
- **Color theme picker** — user-selectable accent color
- **Media Session API** — lock screen controls (attempted, reverted — needs debugging on iOS)
- **Cover art** — `cover_art_s3_key` exists on both `albums` and `tracks` schema; UI not built yet

---

## Active Schema

```sql
CREATE TYPE genre_type AS ENUM (
  'rock', 'pop', 'hip_hop', 'r_and_b', 'jazz', 'classical',
  'electronic', 'country', 'folk', 'metal', 'punk', 'blues',
  'reggae', 'latin', 'world', 'other'
);

CREATE TABLE albums (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  release_year    SMALLINT NOT NULL,
  cover_art_s3_key TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tracks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id         UUID NOT NULL REFERENCES albums(id) ON DELETE RESTRICT,
  title            TEXT NOT NULL,
  s3_key           TEXT NOT NULL UNIQUE,
  cover_art_s3_key TEXT,
  mime_type        TEXT NOT NULL DEFAULT 'audio/mpeg',
  file_size_bytes  BIGINT,
  duration_ms      INTEGER,
  genre            genre_type,
  bpm              SMALLINT,
  release_year     SMALLINT NOT NULL,
  track_number     SMALLINT,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  is_archived      BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Key Conventions

- **Cover art fallback:** `tracks.cover_art_s3_key` takes precedence over `albums.cover_art_s3_key`. Fall back to album art if track art is null.
- **Presigned URLs:** Always query params (`?key=`), never path params. See Hard Rules above.
- **Genre:** Postgres `genre_type` enum. Do not suggest migrating to plain text.
- **`album_id` NOT NULL:** Every track must belong to an album. No orphaned tracks.
- **`is_published` defaults `false`:** New tracks seeded/uploaded are unpublished by default. Demo tracks are the exception.
- **Soft deletes:** Use `is_archived = true`. No hard deletes on albums or tracks.

---

## Engineering Preferences

- **DRY but pragmatic** — three similar lines is fine; don't abstract prematurely
- **Right-sized solutions** — no over-engineering, no future-proofing for hypotheticals
- **Handle edge cases explicitly** — don't silently swallow errors; log with context
- **Explicit over clever** — readable code wins over terse one-liners
- **Thoughtfulness over speed** — propose before implementing on non-trivial changes

---

## Security Requirements

- All secrets via env vars — never in source
- Rate limiting on all public Express routes (`express-rate-limit`)
- `helmet` applied globally before all routes
- Input validation on all Express route params and query strings
- CORS restricted by environment (see Infrastructure section)
- AWS IAM: credentials should have `s3:GetObject` only on the specific bucket

---

## How to Present Issues

Use this format for non-trivial problems:

```
Problem: <what's wrong> (file:line if applicable)
Options:
  A) <approach> — effort: low/med/high | risk: low/med/high | maintenance: low/med/high
  B) <approach> — ...
Recommendation: <which and why>
Check-in before writing code.
```

---

## UX / UI Direction

- **Dark/light mode from day one** — use Tailwind `dark:` variant; don't bolt it on later
- **Sharp and geometric, softened by rounded corners** — not bubbly, not brutalist
- **Depth via shadows and layered surfaces** — `bg-gray-950` base, `bg-gray-900` cards, `bg-gray-800` overlays
- **Bold typography as a design element** — large headings, tight tracking
- **Strong accent against neutral palette** — current accent: violet (`violet-500`) against gray neutrals

---

## Mentorship Framing

Act as a **Technical Lead mentoring an intermediate developer**:
- Be direct — skip diplomatic softening on technical calls
- Challenge decisions when something is architecturally questionable
- Flag security and performance issues proactively, not reactively
- Ask clarifying questions on DB/API decisions before implementing (user's self-identified weak area)
- Explain the *why* behind recommendations, not just the *what*
- Guide toward best practices without being prescriptive about style
