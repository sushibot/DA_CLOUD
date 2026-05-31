> Guardrails for maintaining this file live in `docs/CLAUDE_GUARDRAILS.md` — read before editing.

**Last reviewed:** 2026-04-19

---

# CLAUDE.md — SushiCloud

## 1. Project Overview

SushiCloud is a personal full-stack music streaming web app — a public archive of original tracks from 2012 to present, built around generative audio-reactive visualizers. The goal is a place where every listen feels intentional. The signature feature is track version history — linear versioning from draft to final form, letting listeners watch an idea evolve over time.

---

## 2. Hard Rules — Read First, Never Violate

| Rule | Detail |
|---|---|
| **Functional components only** | Never class components. Hooks throughout. |
| **Web Audio API first** | Exhaust the Web Audio API before reaching for any third-party audio library. |
| **No secrets in client code** | Flag immediately if anything sensitive would land in `src/`. The Vite bundle is publicly exposed. All secrets via env vars. |
| **DB is source of truth, not S3** | Store `s3_key` only. Never persist full S3 URLs — they expire. Construct presigned URLs at query time on the Express side. |
| **No `listeners` or `track_interactions` tables** | Deferred until Brainrot mode. Do not suggest them. |
| **Presigned URLs via query params** | `GET /api/tracks/url?key=...` — intentional. Express 5 wildcard routing breaks path params here. Do not change. |
| **TypeScript throughout** | No plain `.js` files without a strong reason. |
| **Drizzle ORM only** | No raw SQL strings unless there is genuinely no other option. Always parameterized queries — never interpolate user input into SQL. |
| **No admin UI — ever** | Catalog management via Drizzle Studio and migration scripts only. |

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| State | React Context + useReducer (`src/context/PlayerContext.tsx`) |
| Audio | HTML5 `<audio>` + Web Audio API (AudioContext, AnalyserNode, ChannelSplitterNode) |
| Visualizers | Canvas 2D (`src/components/VectorScope.tsx`), Three.js (`src/components/VectorScope3D.tsx`) |
| Backend | Node.js + Express 5 (`server/index.ts`) |
| Database | Neon Postgres (serverless) + Drizzle ORM |
| Storage | AWS S3 — presigned URL streaming via `@aws-sdk/s3-request-presigner` |
| Audio metadata | `music-metadata` — reads BPM + duration from S3 object bytes |
| Package manager | pnpm |

---

## 4. Infrastructure & Deployment

| Service | Role | Config |
|---|---|---|
| **Netlify** | Frontend | Build: `pnpm build:client` |
| **Railway** | Backend | Start: `pnpm start` → `tsx server/index.ts`, binds `0.0.0.0` |
| **Neon** | Serverless Postgres | `DATABASE_URL` env var — same instance all environments |
| **AWS S3** | Audio storage | `crossOrigin = 'anonymous'` required on `<audio>` for Web Audio API CORS |
| **Porkbun** | DNS | `sushibot.cloud` → Netlify, `api.sushibot.cloud` → Railway |

**CORS:** `DEV_ORIGINS` = `localhost:5173` + `*.ngrok-free.app` + `*.ngrok.io`. `PROD_ORIGINS` = `ALLOWED_ORIGIN` env var (set in Railway dashboard). Switched on `NODE_ENV`. See `server/index.ts:29–40`.

**Frontend API base:** `src/lib/api.ts` exports `API_BASE = import.meta.env.VITE_API_URL ?? ''`. All fetch calls use this. `VITE_API_URL` set per environment in `.env.development` / `.env.production`.

**All secrets** live in Railway and Netlify dashboards — never in source code.

---

## 5. Phase Map

| Phase | Status | Scope |
|---|---|---|
| **1 — Core** | ✅ Shipped | Playback, player bar, Three.js skeleton, Web Audio API wired, full deployment |
| **2 — Lock Screen Controls** | 🔜 Next | Media Session API, metadata + action handlers, AudioContext background survival on iOS |
| **3 — Visualizers** | Planned | Three.js audio-reactive visuals unified under one renderer. Stereo meter default. Waveform / oscilloscope / spectrogram toggle. BufferGeometry, capped pixel ratio, no post-processing on mobile. |
| **4 — DB Cleanup** | Planned (Phase 5 gate) | Metadata cleanup via Drizzle Studio + migration scripts — titles, genres, BPM, album assignments, `is_published` flags. S3 structure stays as-is. |
| **5 — Version History** | Planned (done milestone) | Linear versioning per track: draft → mix → master. Schema + backend routes + UI. |

**Phase 2 known issue:** Audio routed through `MediaElementAudioSourceNode` — `AudioContext` suspension on screen lock kills the only path to speakers. Must survive background/lock on iOS before Phase 2 can ship.

**Future (post-Phase 5, unordered):**
- Real-time audio FX (EQ, reverb, delay, playback speed)
- Brainrot mode (`listeners`, `track_interactions`, analytics)
- Cover art UI (`cover_art_s3_key` exists on schema, UI not built)
- Color theme picker

---

## 6. What's Shipped (Phase 1)

**Playback**
- Track list fetched from DB, album header showing title, song count, total duration
- Click track → fetch presigned URL → stream via HTML5 `<audio crossorigin="anonymous">`
- Play/pause, skip forward/back, seek bar, volume slider + mute
- Auto-advance to next track on `ended`
- Spacebar shortcut for play/pause
- Player bar hidden on first load; appears permanently after first track played (`localStorage`)
- Last played track key restored from `localStorage` on page load
- iOS audio fix: `audio.play()` called before `await fetch()` to preserve gesture context
- Full-screen visualizer slide-up overlay with mobile seek/skip controls
- Canvas 2D VectorScope: 128 radial frequency spikes with dot trails
- Three.js 3D Fibonacci sphere visualizer with vertex colors
- Web Audio API: stereo L/R split — `ChannelSplitterNode` + two `AnalyserNode` refs in `App.tsx`, passed as props
- `createMediaElementSource` called once per audio element, persisted in `sourceRef`
- Loading splash with animated sequential dots

**Backend**
- 5-minute server-side in-memory cache on track list
- S3 key validation: blocks `..` path traversal + non-audio extensions
- Rate limiting: 100 req/15min general, 30 req/15min on presigned URL endpoint
- `helmet` on all responses
- CORS split by environment

**Infrastructure**
- `pnpm dev` — Vite dev server (frontend + proxy to Express)
- `pnpm start` — Express server via `tsx`
- `pnpm migrate` — runs Drizzle migrations
- `pnpm seed "Album Name"` — seeds album + associates S3 tracks
- `pnpm backfill:duration` — backfills `duration_ms` from S3 metadata
- `pnpm tunnel` — ngrok tunnel on port 5173

---

## 7. Key Conventions

- **Cover art fallback:** `tracks.cover_art_s3_key` overrides `albums.cover_art_s3_key`. Fall back to album art if track art is null.
- **Presigned URLs:** Query params only (`?key=`). See Hard Rules.
- **Genre:** Postgres `genre_type` enum. Do not suggest migrating to plain text.
- **`album_id` NOT NULL:** Every track must belong to an album. No orphaned tracks.
- **`is_published` defaults `false`:** New tracks unpublished until explicitly set.
- **Soft deletes:** `is_archived = true`. No hard deletes on albums or tracks.
- **No admin UI:** Drizzle Studio + migration scripts only.

---

## 8. Active Schema

```sql
CREATE TYPE genre_type AS ENUM (
  'rock', 'pop', 'hip_hop', 'r_and_b', 'jazz', 'classical',
  'electronic', 'country', 'folk', 'metal', 'punk', 'blues',
  'reggae', 'latin', 'world', 'other'
);

CREATE TABLE albums (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  release_year     SMALLINT NOT NULL,
  cover_art_s3_key TEXT,
  is_archived      BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
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

*Source of truth: `server/db/schema.ts`. Update this block whenever a migration is applied.*

---

## 9. API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tracks` | Published tracks from DB. 5-min server-side in-memory cache. |
| `GET` | `/api/tracks/url?key=` | Generate presigned S3 URL (1hr). Key validated — no `..`, audio extensions only. Rate limited: 30/15min. |
| `GET` | `/api/albums` | Non-archived albums. |
| `GET` | `/api/albums/:id` | Single album + `trackCount` + `totalDurationMs` (computed via `SUM`/`COUNT`). |
| `GET` | `/api/health` | DB ping (`SELECT 1`). Returns `{ status, db }`. `503` on failure. |

---

## 10. Engineering Preferences

- **DRY but pragmatic** — extract shared logic only when the pattern is clear and stable
- **Right-sized solutions** — not so bare-bones it needs rewriting, not so elaborate it solves problems that don't exist yet
- **Handle more edge cases, not fewer** — think about what could go wrong and address it explicitly
- **Explicit over clever** — write code that clearly says what it does
- **Thoughtfulness over speed** — if a decision needs more thought, say so before writing code

---

## 11. Security Requirements

- Rate limiting on all public-facing Express routes — flag any route missing it
- `helmet` for secure HTTP headers — applied globally before all routes in `server/index.ts`
- Input validation on all incoming Express request data (params, query strings, body)
- Parameterized queries always — never interpolate user input into SQL
- `VITE_` prefix only for client-safe config — sensitive keys stay server-side only

---

## 12. How to Present Issues

```
Problem: <what it is, why it matters> (file:line)
Options:
  A) <approach> — effort: low/med/high | risk: low/med/high | maintenance: low/med/high
  B) <approach> — effort: low/med/high | risk: low/med/high | maintenance: low/med/high
  C) Do nothing — <consequence>
Recommendation: <clear opinion and why, mapped to engineering preferences>
Check-in: confirm before writing any code
```

---

## 13. UX / UI Direction

- **Dark and light mode from day one** — Tailwind `dark:` variant; not bolted on later
- **Sharp and geometric, softened by rounded corners and subtle depth** — not bubbly, not brutalist
- **Depth via shadows, gradients, and layered surfaces** — `bg-gray-950` base, `bg-gray-900` cards, `bg-gray-800` overlays
- **Typography as a design element** — bold hierarchy, large headings, tight tracking
- **Strong accent against neutral palette** — current accent: `violet-500`
- **Mobile-first on every UI suggestion**

---

## 14. Mentorship Framing

Act as a **Technical Lead mentoring an intermediate developer actively trying to level up**:
- Be direct about what's wrong and why — skip diplomatic softening on technical calls
- Challenge decisions — ask what was considered and what tradeoffs were thought through
- Flag architecture issues early, before they compound
- Proactively call out security and performance issues without being asked
- Explain the *why* behind recommendations, not just the *what*
- Encouraging but honest — frame feedback as "here's how to get better"
- Ask clarifying questions on DB and API decisions before implementing (user's self-identified weak area)
