# Pathforge

AI-powered personalized learning paths: **generate → guide → teach → curate**.

You say what you want to learn. Pathforge builds a path (stages → modules → short lesson cards), tracks progress, attaches real resources (Serper + optional YouTube), and offers a module-scoped tutor. Content is generated **lazily and cached**.

## Stack

- **Next.js 16** (App Router) on Vercel
- **Supabase** — Auth (Google + GitHub) + Postgres + RLS
- **Vercel AI Gateway** + AI SDK (`generateObject` / `streamText`)
- **Serper** — web resource search
- **YouTube Data API** — optional video enrichment
- **shadcn-style UI** + Tailwind v4

## Quick start

```bash
cd pathforge
pnpm install
cp .env.example .env.local
# paste keys into .env.local
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL** → run [`supabase/migrations/001_pathforge.sql`](./supabase/migrations/001_pathforge.sql)
3. **Authentication → Providers** → enable **Google** and **GitHub**
4. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. Copy **Project URL** + **anon key** into `.env.local`

### 2. Vercel AI Gateway

1. Create an AI Gateway API key in the [Vercel dashboard](https://vercel.com/docs/ai-gateway)
2. Set `AI_GATEWAY_API_KEY` in `.env.local`
3. Optional model overrides: `AI_MODEL_FAST`, `AI_MODEL_STRONG` (format `provider/model`)

### 3. Serper

1. Get a key at [serper.dev](https://serper.dev) (~2,500 free queries)
2. Set `SERPER_API_KEY`

### 4. YouTube (optional)

1. Enable YouTube Data API v3 in Google Cloud
2. Set `YOUTUBE_API_KEY` — videos are merged into module resources when present

### 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm test        # LearningGeneration seam tests
pnpm typecheck
pnpm build
```

## Product loop

1. Sign in (Google / GitHub)
2. Start **AI Engineering** pack or any free-prompt topic
3. Intake → diagnostic → **L0** stage outline
4. Open stage → **L1** modules · open module → **L2** cards + quiz + resources
5. Mark complete · Today = next incomplete module
6. Tutor / Challenge me (**L3**)

**AI Engineering pack** = suggestion + defaults + fixed diagnostic bank only.  
**All lessons are AI-generated** at runtime (nothing imported from an external curriculum).

## Docs

| Doc | Path |
|-----|------|
| Plan | [`docs/PLAN.md`](./docs/PLAN.md) |
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Domain glossary | [`CONTEXT.md`](./CONTEXT.md) |
| v0 spec | [`.scratch/pathforge-v0/spec.md`](./.scratch/pathforge-v0/spec.md) |
| Env template | [`.env.example`](./.env.example) |
| SQL migration | [`supabase/migrations/001_pathforge.sql`](./supabase/migrations/001_pathforge.sql) |

## Env reference

See [`.env.example`](./.env.example) for every key:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, server scripts)
- `AI_GATEWAY_API_KEY`
- `AI_MODEL_FAST` / `AI_MODEL_STRONG`
- `SERPER_API_KEY`
- `YOUTUBE_API_KEY` (optional)
- `NEXT_PUBLIC_SITE_URL`
- `GENERATION_DAILY_BUDGET` (default 40 successful gens/user/day)

## License

Private / portfolio project unless otherwise noted.
