# Spec: Pathforge v1 — learning-loop polish

Status: ready-for-agent

## Problem Statement

Pathforge’s core loop works: intake → diagnostic → path → stage modules → MDX lesson → optional quiz/notes/tutor → mark complete. The UI redesign made the product look intentional. What still breaks trust and flow for a first serious learner:

- **Navigation friction.** From a module you only get “← stage”. No breadcrumbs, no next/previous module, no clear “what’s next” after Mark complete. Learners bounce to stage/path lists constantly.
- **Progress is thin.** Dashboard shows `done/total` but not percent, remaining time, or why Today picked this module. Path/stage pages don’t feel like a progress surface.
- **Daily-use surfaces feel bolted on.** Notes require manual Save. Tutor lacks stop/retry, markdown, and suggested prompts. Quiz chrome is bare (weak selected/disabled states, no summary).
- **Generation edges are unfinished.** Failures show a message but retry/cancel affordances are inconsistent. Daily AI budget exists server-side but learners get a hard error with no soft warning. Regenerate is all-or-nothing with no direction (“shorter”, “more examples”).
- **Lesson reading still has gaps.** No scroll/section reading progress, no resume-at-heading, no focus/print mode, code blocks lack copy/language label, Callout/Steps exist but “Common mistake” / “Try this” don’t get distinctive treatment, no module footer nav.
- **Chrome and empty states.** Mobile path switching is awkward; empty/error/skeleton states don’t always match final layout; generation status has `aria-live` in one place but not consistently; no skip link / full focus pass on diagnostic + quiz.
- **Launch leftovers.** No `og:image` / rich Twitter card; no lightweight product analytics for drop-off (path_created, lesson_ready, module_completed, tutor_message); double-submit and chat rate limits are weak in the UI.

The learner should finish one real session—open Today → read → optional check → notes → tutor touch → complete → land on the next module—without confusion or “is it broken?” moments.

## Solution

Ship a **v1 learning-loop polish** pass that does not invent v2 product surface (no spaced review, path revise, freemium plans, multi-module tutor, PWA, email digests). Make the existing loop feel finished:

1. **Move through the path** — breadcrumbs; previous/next module; post-complete continue nudge; path-ordered navigation presenter.
2. **Honest progress** — percent + remaining minutes on dashboard/path/stage; richer Today CTA with pick reason; layout-matched skeletons; purposeful empty states.
3. **Generation trust** — consistent error + retry; optional cancel where in-flight UI allows; soft budget warning near limit; regenerate-with-short-direction; skeleton completeness signal when lesson is thin/invalid.
4. **Lesson reading quality** — top reading progress; client-persisted resume (heading/scroll); focus mode; MDX code copy + language label; stronger callout styling for skeleton sections; resource card polish.
5. **Tutor / notes / quiz daily use** — tutor stop, retry last, copy, markdown bubbles, suggested prompts, mobile collapse + FAB, safer challenge toggle; notes debounced autosave + last-saved; quiz focus/selection/score summary.
6. **Chrome, a11y, SEO, hardening** — mobile paths access; skip link + landmarks; diagnostic/quiz keyboard pass; live regions; route error boundaries with retry; og:image + twitter summary_large_image; basic analytics events; UI disable + server-safe double-submit on complete/regenerate/chat.

Prefer **pure presenters** beside existing learning libs; keep **LearningGeneration** as the only token boundary; **no hand-written SQL**—Drizzle schema only if a table is truly required (v1 default: client-only reading position, no new tables).

## User Stories

### Navigation and path movement

1. As a **learner on a module**, I want breadcrumbs Path → Stage → Module, so that I always know where I am and can jump up a level.
2. As a **learner on a module**, I want Previous / Next module controls, so that I can move through the stage without returning to the stage list.
3. As a **learner who marks a module complete**, I want a clear continue affordance to the next incomplete module (or a path-complete state), so that momentum isn’t lost.
4. As a **learner on the last module of a stage**, I want Next to take me to the first module of the next stage when it exists (or explain that the next stage still needs generation), so that path order is respected.
5. As a **learner on the first module**, I want Previous disabled or omitted, so that dead controls don’t appear.
6. As a **learner on mobile**, I want an obvious way to reach Dashboard / my paths / active path, so that I am not trapped inside one module.

### Progress honesty

7. As a **learner on the dashboard**, I want percent complete and remaining estimated minutes for my active path, so that progress is tangible.
8. As a **learner on the Today card**, I want a strong CTA like “Start · 12 min” (or Continue) plus a short reason this module was chosen, so that I trust the recommendation.
9. As a **learner on the path page**, I want overall and per-stage progress (done/total, percent, optional remaining time), so that the outline is a progress surface.
10. As a **learner on the stage page**, I want module list progress and remaining time for that stage, so that I can plan a session.
11. As a **learner who finished every module**, I want a clear path-complete empty/success state instead of a broken Today card, so that completion feels earned.
12. As a **learner waiting for L1/L2**, I want skeletons that resemble the final layout, so that the page doesn’t jump and feel broken.

### Generation trust

13. As a **learner whose L1 or L2 failed**, I want the error message and a Retry control that actually re-invokes generation, so that I can recover without refresh archaeology.
14. As a **learner waiting on generation**, I want honest phases only (no fake looping), elapsed when useful, and accessible status updates, so that I know work is real.
15. As a **learner near my daily generation budget**, I want a soft warning before I hit the wall, so that I’m not surprised by a hard failure.
16. As a **learner who hits the budget**, I want a clear, calm explanation of the limit and when it resets (UTC day), so that I understand the constraint.
17. As a **learner regenerating a lesson**, I want an optional short direction (e.g. “more examples”, “shorter”, “more advanced”), so that regenerate isn’t a blind roll of the dice.
18. As a **learner on a lesson missing required teaching-skeleton sections**, I want a visible quality warning and regenerate CTA, so that I don’t study an incomplete module unknowingly.
19. As a **learner on a legacy short-card lesson**, I still want the existing upgrade banner and regenerate path, so that v0 content remains recoverable.
20. As a **learner double-clicking Mark complete or Regenerate**, I want a single in-flight request, so that state doesn’t thrash.
21. As a **learner whose regenerate is running**, I want disabled controls and clear “Regenerating…” copy, so that I don’t start a second job.

### Lesson reading

22. As a **learner scrolling a long MDX lesson**, I want a thin reading progress indicator, so that I can gauge remaining effort.
23. As a **learner returning to a module**, I want to resume near my last heading or scroll position on this device, so that re-entry is cheap.
24. As a **learner who wants zero distraction**, I want a focus mode that hides non-lesson chrome (tutor/notes/extra chrome) while keeping the lesson and TOC, so that I can deep-read.
25. As a **learner reading code in a lesson**, I want fenced blocks to show a language label and a copy button, so that examples are usable.
26. As a **learner on Common mistake / Try this / tips**, I want callouts that are visually distinct by intent, so that those sections scan faster.
27. As a **learner using the sticky TOC**, I want active-section highlighting to keep working with resume and focus mode, so that orientation never regresses.
28. As a **learner at the bottom of the lesson**, I want next/prev module controls repeated in a footer, so that I don’t scroll back to the top to continue.
29. As a **learner on a narrow viewport**, I want the existing mobile TOC collapse behavior preserved and improved if needed, so that the reading column stays clean.

### Resources

30. As a **learner in Go deeper**, I want resource cards to show domain (and favicon when cheap/safe), kind, and a clear opens-in-new-tab affordance, so that links feel curated not raw.
31. As a **learner when a module has no resources**, I want a calm empty state that restates that the lesson stands alone, so that “no links” doesn’t feel like a failure.
32. As a **learner opening a resource**, I want `rel` safety (`noreferrer`) preserved, so that tab-napping isn’t introduced.

### Tutor

33. As a **learner in the tutor**, I want streamed answers to render basic markdown (paragraphs, lists, code), so that explanations are readable.
34. As a **learner while the tutor is streaming**, I want to stop generation, so that I’m not stuck waiting on a bad prompt.
35. As a **learner after a tutor error or weak answer**, I want Retry last, so that recovery is one click.
36. As a **learner reading a useful tutor message**, I want to copy it, so that I can paste into notes.
37. As a **learner facing an empty tutor**, I want 3 suggested prompts grounded in the teaching skeleton (e.g. re-explain worked example, quiz me on the idea, unpack common mistake), so that I know what to ask.
38. As a **learner on mobile**, I want the tutor collapsed by default with a sticky “Ask tutor” affordance, so that the lesson remains primary.
39. As a **learner using Challenge me**, I want toggle + in-flight behavior that doesn’t double-send challenges, so that challenge mode feels deliberate.
40. As a **learner sending tutor messages quickly**, I want the send control disabled while in flight and a sensible rate-limit error if the server refuses, so that spam doesn’t brick the thread.
41. As a **learner**, I want the tutor to remain **module-grounded** on the saved lesson, so that v1 doesn’t silently become a general chatbot.

### Notes

42. As a **learner typing notes**, I want debounced autosave, so that I don’t lose work by forgetting Save.
43. As a **learner**, I want a last-saved timestamp (or Saving… / Saved / Error), so that I trust persistence.
44. As a **learner**, I want manual Save removed or demoted once autosave exists, so that the UI doesn’t pretend two sources of truth.
45. As a **learner who wants a backup**, I want an optional export of notes for the current path as markdown, so that my writing isn’t trapped.

### Quiz (optional check)

46. As a **learner on the optional check**, I want clear selected and correct/incorrect styling per question, so that feedback is obvious.
47. As a **learner**, I want keyboard focus and activation on choices, so that the quiz is usable without a mouse.
48. As a **learner who finished the check**, I want a lightweight score summary (e.g. 3/4), so that practice feels complete.
49. As a **learner**, I want it restated that quiz does **not** gate Mark complete, so that honor-system completion stays honest.
50. As a **learner answering one item**, I want other items to remain available until answered, with only the active submit disabled appropriately, so that the block doesn’t feel frozen.

### Empty, error, and loading chrome

51. As a **learner with no paths**, I want a single primary empty-state CTA to create a path, so that the dashboard isn’t a dead end.
52. As a **learner on a draft/diagnostic path**, I want status-appropriate guidance to continue diagnostic, so that I don’t hit a blank ready page.
53. As a **learner on a stage still generating L1**, I want honest status + retry on error, so that empty module lists are explained.
54. As a **learner when a route throws**, I want an error boundary with Retry / back to dashboard, so that a single failure doesn’t white-screen the app.
55. As a **learner on slow navigation**, I want pending UI that doesn’t look like a freeze, so that trust holds.

### Accessibility and SEO

56. As a **keyboard user**, I want a skip link to main content, so that I can bypass chrome.
57. As a **keyboard user**, I want visible focus and logical order on diagnostic, quiz, tutor, and primary nav, so that core flows are operable.
58. As a **screen reader user**, I want generation status and save/tutor errors exposed via appropriate live regions, so that async changes are announced.
59. As a **user with reduced motion**, I want decorative animation to stay minimal (existing global reduce-motion honored), so that polish doesn’t cause harm.
60. As a **visitor sharing Pathforge**, I want Open Graph / Twitter images (`og:image`, large image card), so that links don’t look unfinished.
61. As a **visitor**, I want existing title/description metadata preserved or improved, so that SEO doesn’t regress.

### Hardening and observability

62. As a **product owner**, I want client-safe analytics events for `path_created`, `lesson_ready`, `module_completed`, and `tutor_message` (no PII in event props), so that drop-off is visible.
63. As a **learner**, I want analytics to fail open (never block UX if the sink is down), so that tracking can’t break learning.
64. As a **learner**, I want complete/regenerate/chat actions to be idempotent/single-flight from the UI and safe against double submit server-side where cheap, so that retries don’t corrupt state.
65. As a **learner**, I want regenerate to remain **explicit-only** (never silent), so that cached content non-negotiables hold.

### Content quality controls

66. As a **learner**, I want regenerate direction capped to a short note (length-limited), so that prompts can’t paste novels into the generator.
67. As a **learner**, I want direction treated as optional guidance to L2, not a separate product mode, so that scope stays v1.
68. As a **learner**, I want skeleton validation feedback based on required H2 titles from the teaching skeleton, so that “incomplete” means something concrete.

### Pack / intake continuity

69. As a **learner creating a path**, I want existing intake + diagnostic + pack behavior preserved, so that v1 polish doesn’t rewrite acquisition.
70. As a **learner**, I want domain alerts to remain creation-time only and never appear on marketing pages, so that non-negotiables hold.

### Theme and design system continuity

71. As a **learner**, I want existing light/dark/system theme toggle and token contrast work preserved, so that v1 doesn’t reopen the button/theme rabbit hole.
72. As a **learner**, I want new UI to use existing button/card/badge/input primitives and tokens, so that the design system stays coherent.

## Implementation Decisions

### Scope lock

- **In scope:** all user stories above (navigation, progress, generation edges, reading, resources, tutor, notes, quiz, empty/error/skeletons, a11y/SEO, analytics, regenerate direction, skeleton warning, notes export).
- **Out of scope:** listed in Out of Scope (v2 and non-goals).
- Do **not** re-tokenize primary button colors, radius, or theme boot unless a regression is introduced.
- Do **not** change honor-system completion or quiz non-gating.

### Pure seams (test these)

Prefer pure functions under `src/lib/learning/` (or adjacent) with Vitest, matching existing `today`, `generation-progress`, `lesson-toc`, `lesson-format` style.

1. **Path navigation presenter**  
   Input: ordered modules across stages (stage position, module position, ids/titles/status flags as needed), `currentModuleId`.  
   Output: `{ prev, next, index, total, pathComplete }` where prev/next are null at ends; next-after-complete can equal next incomplete for the nudge.  
   Used by: module footer/header nav, post-complete continue.

2. **Progress summary presenter**  
   Input: modules with `completed_at` and `est_minutes` (optionally filtered to a stage).  
   Output: `{ done, total, percent, remainingMinutes }` with safe empty handling (`total === 0`).  
   Used by: dashboard, path, stage.

3. **Today presentation helper** (extend `pickTodayModule` or thin wrapper)  
   Output includes pick **reason** enum/string suitable for UI (“First incomplete module in path order”) and CTA kind (`start` vs `continue` if you can distinguish unopened vs in-progress cheaply; if not, honest single CTA is fine).  
   Do not invent ML ranking in v1.

4. **Lesson skeleton completeness**  
   Input: MDX string.  
   Output: `{ complete: boolean; missingHeadings: string[] }` against `LESSON_SKELETON_HEADINGS`.  
   Used by: module page banner.

5. **Regenerate direction normalizer**  
   Trim, collapse whitespace, enforce max length (e.g. 200–300 chars), empty → undefined.  
   Used by: regenerate action before L2.

6. **Reading progress helpers**  
   Pure: clamp scroll ratio 0–1; build/parse resume payload `{ moduleId, headingId?, scrollRatio?, updatedAt }`.  
   Persistence: **localStorage / session per browser** in v1 (no new DB table unless implementation hits a hard wall—default is client-only).

7. **Generation progress**  
   Reuse `presentGenerationProgress`; only extend if budget-warning or cancel needs a new phase label. Keep phases honest.

8. **Budget warning presenter** (optional thin pure)  
   Input: `{ used, limit, warnAtRatio }` → `{ level: 'ok' | 'warn' | 'blocked', remaining }`.  
   Server remains source of truth for enforce; UI uses count endpoint or embedded props when cheap.

### Generation / actions

- Keep **LearningGeneration** as the only model/search spend boundary.
- Extend `ensureModuleL2(moduleId, { regenerate?, direction? })` to pass normalized direction into L2 prompt as optional guidance; still full regenerate of lesson/resources/quiz on explicit regenerate (same as today unless you already split—don’t split pipelines in v1).
- Surface budget errors with stable message; add a read of today’s count for soft warn on dashboard or before regenerate when inexpensive (server action or existing budget store behind auth).
- Mark complete / save note / chat: ensure UI single-flight (`useTransition` / local loading) and disable double submit; server keeps authz + RLS.
- Chat API: support abort from client (AbortSignal / stop); preserve module grounding prompt builder.

### Navigation UI

- Breadcrumb component used on path, stage, module (and diagnostic if natural).
- Module page: top actions row keeps Complete + Regenerate; add prev/next; repeat prev/next after lesson (and after complete nudge).
- Post-complete: inline callout with link to next module via navigation presenter; if none, path-complete message + link to path/dashboard.

### Lesson MDX UI

- Reading progress bar fixed or sticky under app header on module lesson.
- Resume: on mount, if stored payload matches module id, scroll to heading id or ratio once (don’t fight user after they scroll).
- Focus mode: client toggle; hide notes/quiz/tutor/resources or collapse to minimal; keep lesson + TOC; persist preference optional.
- Code blocks: enhance MDX `pre`/`code` components with language detection from class and copy button.
- Callouts: map types + optional section-aware styling; ensure existing `<Callout>` / `<Steps>` keep working.
- Resources: domain from URL hostname; optional duck-favicon or text avatar; external icon; keep max 3 product rule untouched.

### Tutor UI

- Markdown render for assistant (safe subset; no raw HTML).
- Stop (abort fetch), retry last user message, copy on assistant bubbles.
- Empty-state suggested prompts from skeleton headings (static templates ok).
- Mobile: default collapsed; FAB or sticky bar opens panel.
- Challenge me: don’t send if already loading; don’t re-fire on every toggle off/on without intent.

### Notes UI

- Debounced autosave (e.g. 400–800ms) calling `saveModuleNote`.
- Status line: Saving… / Saved at {time} / Couldn’t save.
- Path-level notes export: gather notes client or server-side into one markdown download; authz same as path owner.

### Quiz UI

- Selected state, disabled only after that item answered (or while that item pending).
- Keyboard operable choices.
- Summary after all answered (or as user progresses).

### Chrome / empty / errors

- Dashboard empty: no paths → create path.
- Layout-matched skeletons for module/path/stage loading where App Router allows (including `loading.tsx` where it fits).
- Error boundaries (`error.tsx`) on dashboard/paths segments with retry.
- App header: ensure paths/dashboard reachable on small screens (existing header may only need tightening).

### A11y / SEO

- Skip link to `#main`; ensure `main` landmark wraps page content in app chrome.
- Audit diagnostic form, quiz, tutor send, theme toggle for focus rings (tokens already define ring).
- GenerationStatus already `role="status"` / `aria-live="polite"`—extend pattern to notes save and tutor errors.
- Add static `og:image` asset (SVG or PNG in `public/`) and wire metadata `openGraph.images` + Twitter `summary_large_image`.

### Analytics

- Tiny event helper (e.g. `track(event, props?)`) with no-op or console/vendor sink behind env.
- Events: `path_created`, `lesson_ready`, `module_completed`, `tutor_message`.
- Props: path/module ids ok if already user-scoped app; no email, no note bodies, no lesson markdown.

### Design / copy

- Use existing tokens and CVA button variants (equal box model already shipped).
- Copy stays plain and honest; no fake social proof.
- Prefer domain glossary: path, stage, module, lesson, diagnostic, L0–L2, Mark complete, Today, Challenge me, pack, domain alert.

### Data / migrations

- **Default: zero schema changes.**
- Reading resume client-only.
- Notes already persisted; export is read-only aggregation.
- If an implementer believes server resume is required, stop and justify—still prefer Drizzle schema → `pnpm db:generate` → migrate → rls; never hand-write SQL migrations.

### Compatibility

- Legacy card lessons: keep banner + regenerate.
- Auth RLS patterns unchanged.
- Lazy generation cache rules unchanged: no silent regenerate.

## Testing Decisions

### What good tests look like here

- Test **external behavior** of pure presenters and normalizers, not React internals or Supabase.
- No snapshot farms of full pages.
- No live model/network in unit tests; LearningGeneration stays faked at its existing boundary if touched.
- Prefer table-driven cases for navigation order, percent edge cases, skeleton missing headings, direction truncation.

### Modules to test (unit / Vitest)

- Path navigation presenter — first/middle/last; cross-stage next; empty list; unknown current id.
- Progress summary — 0/0, partial, all complete, remaining minutes sum only incomplete.
- Skeleton completeness — all headings present; missing subset; order-insensitive presence check (titles matter).
- Direction normalizer — empty, whitespace, too long, happy path.
- Reading progress helpers — clamp; payload parse/reject stale/wrong shape.
- Budget warning presenter if introduced — ok/warn/blocked thresholds.
- Existing suites (`generation-progress`, `lesson-toc`, `lesson-format`, generation) must stay green; extend when behavior changes.

### Prior art

- `src/lib/learning/*.test.ts` Vitest style.
- Pure functions with explicit inputs/outputs; no render tests required for v1 unless a component owns irreplaceable logic (avoid that).

### Manual / acceptance checks (agent or human)

- Full loop: sign-in → Today → module → scroll/resume → focus mode → notes autosave → quiz one item → tutor suggest + stop → complete → lands on next.
- Fail L2 (mock or bad key in dev) → error + retry UI.
- Budget: with low `GENERATION_DAILY_BUDGET`, warn then block message.
- Mobile widths: tutor collapse, breadcrumbs wrap, prev/next usable.
- Keyboard-only diagnostic + quiz + skip link.
- Link unfurl preview has image locally/production metadata.
- `pnpm test`, `pnpm typecheck`, `pnpm build` clean.

## Out of Scope

- Spaced review / retention scheduling
- Stage-end checkpoint product (beyond existing optional per-module quiz)
- Learning journal across modules (beyond notes export)
- Adaptive depth from intake skill beyond current diagnostic→L0 behavior
- Revise path / rebuild remaining stages when goals change
- Reorder, skip rules engine, lock modules as a policy system
- Archive/duplicate path, pack catalog expansion, shareable read-only outlines
- Tutor citations to lesson headings, voice input, multi-module tutor scope expansion
- Embedded runnable exercises, capstone project modules, resource voting
- Freemium billing, team/classroom, usage billing dashboard (budget soft-warn only)
- PWA offline lesson cache, email digests
- Native apps, multiplayer
- Quiz-gated progress
- Rebuilding marketing landing or design tokens from scratch
- Extracting a separate design-system package
- New AI providers or breaking the single LearningGeneration seam
- Hand-written SQL migrations

## Further Notes

- Origin: post UI redesign (`51caa3b` and follow-ups) roadmap split into v1 polish vs v2 depth; user asked for **full v1** in one spec, not a sliced MVP of four items.
- Non-negotiables from `CONTEXT.md` still bind: no silent regenerate; token-efficient lazy generation; module lesson must stand alone; quizzes don’t gate; domain alerts not on marketing; Drizzle-only schema workflow.
- Implementation may be ticketed as ordered issues under `.scratch/pathforge-v1/issues/` (recommended delivery order below) but this spec is the full acceptance bar for “v1 done.”
- Suggested implement order (dependency-friendly, still all required):
  1. Pure presenters (nav, progress, skeleton, direction, reading helpers)
  2. Breadcrumbs + prev/next + post-complete nudge
  3. Dashboard/path/stage progress + Today CTA reason
  4. Notes autosave + quiz chrome + score summary
  5. Tutor markdown/stop/retry/copy/suggestions/mobile collapse
  6. Generation retry consistency + budget warn + regenerate direction + skeleton banner
  7. Reading progress + resume + focus mode + code copy + callout polish + resources
  8. Empty/skeleton/error boundaries + mobile chrome
  9. A11y pass + og:image + analytics events + double-submit hardening
- Definition of done: a new user can go pack/prompt → diagnostic → path → first lesson → read with progress/resume → notes/quiz/tutor without friction → complete → next module, with generation failures and budget limits explained, and launch SEO/a11y/analytics basics in place—without starting v2 scope.
