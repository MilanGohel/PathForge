# Pathforge — detailed build plan

Status: **decisions locked** (grill confirmed). Scaffold exists (empty Next.js 16 app). Spec: `.scratch/pathforge-v0/spec.md`.

## 1. Product summary

Pathforge lets anyone type what they want to learn and get a **personalized learning path** the product then **guides and teaches** along — with generated lesson cards, curated web/video resources, progress, and a module-scoped AI tutor.

| Ambition | Portfolio + personal learning project |
| Success (3 weeks) | You finish one real path in-app + ≥1 optional quiz attempt + ≥1 tutor/challenge use + demo/README case study |
| Dogfood topic | AI Engineering (fully **AI-generated**, not imported from any external curriculum file) |

## 2. Locked decisions (source of truth)

### Experience
- **Hierarchy:** Path → Stages → Modules → Lesson
- **Intake:** topic + goal + hours/week + optional deadline
- **Diagnostic:** hybrid — fixed question bank for AI Engineering pack; LLM 5–8 questions for free-prompt topics
- **Complete:** Mark complete only (honor system); optional quiz does **not** gate
- **Lesson format:** short cards (concept, why it matters, example, pitfall, try this) + resources + notes
- **Daily guide:** rule engine → next incomplete module + optional one-line AI blurb
- **Tutor:** module-scoped thread + “Challenge me”; grounded on saved lesson
- **Packs:** AI Engineering suggestion only in v0; pack = entry defaults + diagnostic bank; **content always AI-generated**
- **Domain alerts:** rare, creation-time only, for topics hard to learn purely online; never on landing/marketing
- **Loading:** stepped status + streamed content
- **Cache:** persist all generations; revisit = DB read; regenerate only on explicit action

### Lazy generation (token contract)

| Level | Trigger | Output |
|-------|---------|--------|
| **L0** | After intake + diagnostic | Path title, goal summary, est. hours, **stage list only** |
| **L1** | Open a stage | Module titles + one-line blurbs + est. time (that stage only) |
| **L2** | Open a module | Lesson cards + optional quiz + resources (search → rank) |
| **L3** | Open tutor | Chat grounded on saved module lesson |
| **L4** | Today blurb (optional) | One short sentence; target module chosen by rules |

### Tech
- **Next.js** (App Router) on **Vercel**
- **Supabase-centric:** Postgres + Auth + Storage; RLS on all user data
- **Auth:** Google + GitHub OAuth
- **Models:** Vercel AI Gateway + Vercel AI SDK (`streamText` / `generateObject`)
- **Search:** Serper (web); YouTube Data API when videos needed
- **UI:** shadcn/ui + Tailwind v4
- **Jobs:** none until timeouts force them
- **Budgets:** server-side daily gen caps; no user-facing usage meter in v0

### v0 screens
Landing · Auth · Intake · Diagnostic · Path dashboard (Today/Continue) · Stage view · Module (cards, resources, notes, optional quiz, mark complete) · Tutor drawer · Pack gallery · Multi-path list · Regenerate · Rare domain alert

### Out of v0
Payments · native mobile · social/teams/classrooms · full adaptive path re-plan · public share/SEO farm · offline · pack CMS · second curated pack · settings/blog polish · usage meter UI

## 3. Architecture

```
Browser (Next.js RSC + client)
  ├─ Supabase Auth session (Google / GitHub)
  └─ App routes / server actions / route handlers
        ├─ Supabase Postgres (paths, generations, progress, chats) + RLS
        ├─ Vercel AI Gateway (outlines, lessons, tutor, diagnostics)
        ├─ Serper (resource search)
        └─ YouTube Data API (optional video resolution)
```

### Generation service (core module)
Single application service owns:
- prompt assembly per level (L0–L4)
- structured parse / object generation
- cache lookup before any model call
- search + link assembly for L2 resources
- budget checks and regenerate flags
- persistence of results

UI and route handlers call this service; they do not call the gateway ad hoc.

### Data ownership
- **Pack template** rows (metadata + diagnostic bank + default intake hints) — not full course bodies
- Starting a pack **creates a user-owned path** (clone metadata only), then L0 runs via AI
- Free-prompt paths are user-owned from the first row
- All progress, notes, chats, generated JSON keyed by `user_id` with RLS

## 4. Suggested schema (logical)

- `profiles` — id (auth.uid), display fields, created_at
- `pack_templates` — slug, title, description, diagnostic_bank (json), intake_defaults (json)
- `paths` — user_id, source (pack|prompt), pack_template_id?, topic, goal, hours_per_week, deadline?, title, summary, est_hours, status, domain_alert?, l0_payload, active
- `stages` — path_id, position, title, summary, est_hours, l1_status, l1_payload
- `modules` — stage_id, position, title, blurb, est_minutes, l2_status, completed_at
- `lessons` — module_id, cards (json), generated_at
- `resources` — module_id, title, url, kind (article|video|book|other), provider, verified
- `module_notes` — module_id, user_id, body
- `quiz_items` / `quiz_attempts` — optional; attempts never required for complete
- `tutor_threads` / `tutor_messages` — per module
- `generation_events` — user_id, level, tokens/cost estimate, ok/error (for server budgets)

Exact SQL/migrations live in implementation tickets.

## 5. Build phases

### Phase A — foundation
1. Git init, env example, README
2. shadcn + layout shell
3. Supabase project wiring (server + browser clients)
4. Auth (Google + GitHub) + protected route gate
5. Schema migrations + RLS policies
6. Empty authenticated home / multi-path list shell

### Phase B — path creation loop
1. Landing + pack gallery (AI Engineering CTA)
2. Intake form
3. Diagnostic (pack bank + LLM path for free prompt)
4. L0 generation + path dashboard (stages only)
5. Domain alert banner when classifier fires
6. Cache + stepped/streaming loading UX for L0

### Phase C — learn loop
1. L1 on stage open
2. L2 on module open (cards + Serper resources + optional quiz)
3. Mark complete + progress % 
4. Notes
5. Today/Continue rules
6. Regenerate controls (budgeted)

### Phase D — teach
1. Module tutor (L3) streaming chat
2. Challenge me mode
3. Optional quiz UI on lesson page

### Phase E — dogfood harden
1. Server budgets + generation_events
2. YouTube enrichment if resources too weak
3. Error/retry UX, empty states
4. You finish AI Engineering path slice in-product
5. README case study + demo recording checklist

## 6. Implementation order (tickets will mirror this)

See `.scratch/pathforge-v0/spec.md`. Prefer vertical slices:
1. Auth + schema  
2. Intake → diagnostic → L0 → dashboard  
3. L1 → L2 → complete  
4. Tutor + quiz  
5. Pack polish + budgets + dogfood  

## 7. Env vars (expected)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only, if needed for admin seeds
AI_GATEWAY_API_KEY=          # Vercel AI Gateway
SERPER_API_KEY=
YOUTUBE_API_KEY=             # optional until video pass
```

## 8. Test seams (proposed — confirm before heavy test work)

**Primary seam: `LearningGeneration` service** (highest seam)

Contract-style tests with fakes for:
- model gateway
- web search
- clock/budget store
- path repository

Scenarios: cache hit skips model; L0→L1→L2 cascade; regenerate bypasses cache once; budget exceeded errors; resource pipeline drops bad URLs; diagnostic placement returns stage index; “today” picks first incomplete module.

**Secondary seam: repository/RLS** (integration against local Supabase or mocked policy tests later)

**UI:** light smoke only in v0 (optional Playwright later); not the main safety net.

## 9. Explicit non-goals reminder

Do not import or depend on `learn-ai-engineering/LEARNING.md` or any hand-authored full curriculum. The product AI generates AI Engineering like any other topic.
