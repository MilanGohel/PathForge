# Pathforge architecture

## Runtime diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js on Vercel                   │
│  RSC pages · client islands · route handlers/actions    │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              ▼                           ▼
     ┌────────────────┐         ┌─────────────────────┐
     │    Supabase    │         │ Learning Generation │
     │ Auth · Postgres│◄───────►│ service (L0–L4)     │
     │ RLS · Storage  │         └──────────┬──────────┘
     └────────────────┘                    │
                         ┌─────────────────┼─────────────────┐
                         ▼                 ▼                 ▼
              ┌──────────────────┐ ┌─────────────┐ ┌─────────────────┐
              │ Vercel AI Gateway│ │   Serper    │ │ YouTube Data API│
              │ (AI SDK client)  │ │  web search │ │ (optional vids) │
              └──────────────────┘ └─────────────┘ └─────────────────┘
```

## Lazy generation state machine (per entity)

```
stage:   empty → generating_l1 → ready (| regenerating → ready)
module:  listed → generating_l2 → ready (| regenerating → ready)
path:    draft → diagnostic → generating_l0 → ready
```

Reads never flip `ready → generating` unless `regenerate=true`.

## Authn/z

- Supabase Auth: Google + GitHub
- Session in cookies via official SSR helpers
- RLS: `auth.uid() = user_id` on all learner-owned tables
- Pack templates: read for authenticated users

## Why one generation seam

All token spend, caching rules, and search fan-out go through one service so:
- UI cannot accidentally double-call the model
- budgets are enforceable
- tests fake one boundary

## Related docs

- Product plan: `docs/PLAN.md`
- Domain glossary: `CONTEXT.md`
- Spec: `.scratch/pathforge-v0/spec.md`
