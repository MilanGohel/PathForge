# Pathforge

**Your personal curriculum, forged for how you learn.**

Pathforge is an AI learning app. You share a goal; it builds a staged path and teaches you one module at a time — real written lessons, optional curated resources, clear progress, and a module-scoped tutor.

## What you get

- **A path that fits you** — stages and modules shaped by your goal and a short placement quiz
- **Lessons that teach** — full module lessons with topic-specific outlines (not skim cards)
- **Today’s next step** — always know what to open; mark complete when you’re ready (no quiz gates)
- **Help when stuck** — notes, a light self-check, and a tutor grounded in the current module
- **Optional packs** — e.g. AI Engineering as a suggested starting point, or any custom topic

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind v4
- **Supabase** — Auth (Google + GitHub), Postgres, RLS
- **Drizzle ORM** — schema source of truth (`src/db/schema.ts`)
- **Vercel AI Gateway** + AI SDK
- **Serper** — web resource search · **YouTube Data API** (optional videos)
- **MDX** lessons · optional **Mermaid** diagrams in the client

## Quick start

```bash
pnpm install
cp .env.example .env.local
# fill in keys (see below)
```

### 1. Supabase + Drizzle

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** + **anon key** into `.env.local`
3. Set **both** pooler URLs (Supabase → Database → Connection string):
   - `DATABASE_URL` — **Transaction** pooler `:6543` + `?pgbouncer=true` (app)
   - `DIRECT_URL` — **Session** pooler `:5432` (migrations / RLS)
4. Apply schema (Drizzle only — never hand-write SQL migrations):

```bash
pnpm db:generate   # schema.ts → drizzle/*.sql
pnpm db:migrate    # uses DIRECT_URL
pnpm db:rls        # RLS, auth trigger, pack seed
# or: pnpm db:setup
```

5. **Authentication → Providers** → enable **Google** and **GitHub**
6. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

See [`CLAUDE.md`](./CLAUDE.md) for migration rules.

### 2. AI Gateway

1. Create an AI Gateway key in the [Vercel dashboard](https://vercel.com/docs/ai-gateway)
2. Set `AI_GATEWAY_API_KEY`
3. Optional: `AI_MODEL_FAST`, `AI_MODEL_STRONG` (`provider/model`)

### 3. Serper (+ optional YouTube)

1. [serper.dev](https://serper.dev) → `SERPER_API_KEY`
2. Optional: YouTube Data API v3 → `YOUTUBE_API_KEY`

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Product loop (dev view)

1. Sign in → start **AI Engineering** pack or a custom topic  
2. Intake + placement quiz → path outline (stages)  
3. Open a stage → modules · open a module → lesson + quiz + resources  
4. Progress, notes, module tutor · regenerate only on explicit user action  

**AI Engineering pack** = defaults + fixed diagnostic bank. Course body is generated at runtime.

## Docs

| Doc | Path |
|-----|------|
| Domain glossary | [`CONTEXT.md`](./CONTEXT.md) |
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Plan | [`docs/PLAN.md`](./docs/PLAN.md) |
| ADRs | [`docs/adr/`](./docs/adr/) |
| Env template | [`.env.example`](./.env.example) |
| Schema | [`src/db/schema.ts`](./src/db/schema.ts) |

## Env reference

See [`.env.example`](./.env.example):

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, server scripts)
- `DATABASE_URL` / `DIRECT_URL`
- `AI_GATEWAY_API_KEY` · `AI_MODEL_FAST` · `AI_MODEL_STRONG`
- `SERPER_API_KEY` · `YOUTUBE_API_KEY` (optional)
- `NEXT_PUBLIC_SITE_URL`
- `GENERATION_DAILY_BUDGET` (default 40 successful gens/user/day)

## License

Private / portfolio project unless otherwise noted.
