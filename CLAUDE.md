# Pathforge — agent rules

## Database / migrations (non-negotiable)

- **Drizzle ORM only** for schema. Source of truth: `src/db/schema.ts`.
- **Never hand-write SQL migration files** under `drizzle/` or elsewhere.
- Workflow:
  1. Edit `src/db/schema.ts`
  2. `pnpm db:generate` — drizzle-kit emits migration SQL
  3. `pnpm db:migrate` — apply table migrations
  4. `pnpm db:rls` — apply RLS / triggers / seed from `src/db/rls.ts` (TS source, not a freehand migration)
- `pnpm db:push` is for throwaway local experiments only — prefer generate + migrate for real changes.
- Requires `DATABASE_URL` in `.env.local` (Supabase Database connection string).

## Product

- AI Engineering pack = defaults + diagnostic bank only; **all course body is AI-generated**.
- Lazy generation L0→L4; cache forever; regenerate only on explicit user action.
