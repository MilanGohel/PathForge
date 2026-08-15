# Pathforge v1 — implementation notes

Shipped against `.scratch/pathforge-v1/spec.md`.

## Pure seams (Vitest)

| Module | Role |
|--------|------|
| `path-navigation` | prev/next/nextIncomplete/index/total/pathComplete |
| `progress-summary` | done/total/percent/remainingMinutes |
| `budget-warning` | ok/warn/blocked |
| `regenerate-direction` | trim + max length |
| `reading-progress` | clamp, resume payload parse/build |
| `lesson-format.presentSkeletonCompleteness` | missing teaching H2s |
| `today.pickTodayModule` | + reason + ctaKind |

## Key UI wiring

- Breadcrumbs on path/stage/module
- Module prev/next + post-complete nudge
- Dashboard/path/stage progress bars + Today CTA
- Notes autosave; quiz score; tutor markdown/stop/retry/copy/suggestions/mobile FAB
- Regenerate optional direction → L2 prompt
- Skeleton incomplete banner; budget soft warn on dashboard
- Reading progress bar, resume (localStorage), focus mode, code copy
- Resource cards with host label
- Skip link + `#main`; error/loading boundaries; `og.svg` metadata
- Analytics fail-open: path_created, lesson_ready, module_completed, tutor_message

## Non-goals kept

No schema migrations; client-only resume; no silent regenerate; quiz non-gating.
