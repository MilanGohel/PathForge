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
- Env:
  - `DATABASE_URL` — transaction pooler `:6543?pgbouncer=true` (app)
  - `DIRECT_URL` — session pooler `:5432` (**required** for `db:migrate` / `db:rls`)
- `pnpm db:migrate` runs `scripts/db-migrate.ts` (postgres.js `prepare: false`). Do not use bare `drizzle-kit migrate` against PgBouncer — it hits “prepared statement does not exist”.

## Product

- AI Engineering pack = defaults + diagnostic bank only; **all course body is AI-generated**.
- Lazy generation L0→L4; cache forever; regenerate only on explicit user action.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
