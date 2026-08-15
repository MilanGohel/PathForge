# Spec: UI / UX / production redesign

Status: ready-for-agent

## Problem Statement

Pathforge’s learning content (especially MDX modules) is good enough to keep, but the product does not feel production-grade around it.

From the learner’s perspective:

- The **landing page** looks like a thin starter template, not a high-quality education/AI product. Copy is outdated (still implies “short lesson cards”).
- The **app chrome** (header, dashboard, path/stage/module shells) is inconsistent and low-polish: generic teal buttons, sparse hierarchy, weak empty/error states.
- **Generation waiting UX is misleading.** A checklist of checkpoints appears to complete, then **starts over**, so it feels like the system is stuck or lying. Progress is not tied to real work (diagnostic → L0 → L1 → L2).
- **Light and dark** are barely designed; neutrals and type don’t feel intentional.
- Long **lessons** lack reading chrome (e.g. section outline), so a 10–15 minute MDX lesson feels like a wall of content in a plain column.
- Overall **trust and clarity** suffer: marketing doesn’t sell the real product loop, and in-app waiting doesn’t communicate truthfully.

The user wants a deliberate redesign: high-quality landing, cohesive design system, honest generation UX, and production-minded polish (a11y, empty/error, SEO)—without rewriting the learning backend.

## Solution

Redesign Pathforge’s presentation layer end-to-end using decisions locked in the UI/UX grill:

1. **Design tokens + core components first** (near-neutral surfaces, sparing teal accent, Geist app-wide, one display face on marketing, light and dark both intentional).
2. **Split chrome:** marketing header vs signed-in app header.
3. **Landing** that does clarity → desire → CTA: hero, proof strip, how it works, features, static path/module mock, AI Engineering pack, FAQ, footer—no fake testimonials.
4. **Honest generation progress:** only real stages; never a looping fake checklist. A small pure **generation progress presenter** maps phase → UI steps.
5. **Lesson reading experience:** comfortable reading column + sticky H2 TOC (from MDX) on desktop; keep MDX teach surface and legacy upgrade banner behavior.
6. **Production bar:** empty/error states, focus/contrast/keyboard basics, landing SEO meta—not a full analytics/e2e program.

Backend generation, Drizzle schema, Supabase auth, and L2 MDX content pipeline stay as-is unless a tiny contract is needed for progress labels.

## User Stories

1. As a **visitor**, I want a polished landing hero that states what Pathforge is in one breath, so that I immediately understand the product.
2. As a **visitor**, I want a single primary CTA (“Start learning” / sign-in), so that I know the next step.
3. As a **visitor**, I want a secondary “How it works” path, so that I can learn the loop without signing up first.
4. As a **visitor**, I want a short proof strip (e.g. personalized paths · lessons that teach · real resources), so that benefits scan in seconds.
5. As a **visitor**, I want a clear How it works section (intake → diagnostic → path → module lessons), so that the product model is obvious.
6. As a **visitor**, I want a feature row that matches the real product (generate, guide/teach, curate—with MDX lessons, not “short cards”), so that marketing matches reality.
7. As a **visitor**, I want a static visual mock of a path/module, so that I can picture the product without waiting on AI.
8. As a **visitor**, I want an AI Engineering pack CTA, so that I have a concrete way to start.
9. As a **visitor**, I want a short FAQ, so that common doubts (cost, generation time, packs vs free-prompt) are answered.
10. As a **visitor**, I want a refined footer, so that the page feels finished.
11. As a **visitor**, I want correct SEO title/description (and basic social meta), so that shared links look professional.
12. As a **visitor**, I want the landing to look excellent in **light and dark**, so that my system theme doesn’t make the brand look broken.
13. As a **visitor**, I want restrained marketing motion that respects reduced-motion, so that the page feels alive without nausea.
14. As a **visitor**, I want marketing navigation (logo, how-it-works, sign in, primary CTA), so that I can move with intent.
15. As a **signed-in learner**, I want an app header (logo, dashboard, new path, account/sign out), so that app chrome doesn’t look like marketing.
16. As a **learner**, I want comfortable density in the app (not sparse marketing spacing), so that I can focus on learning.
17. As a **learner**, I want near-neutral UI with teal used as accent, so that content—not chrome—dominates.
18. As a **learner**, I want consistent buttons, cards, inputs, and badges from a small component set, so that every screen feels one product.
19. As a **learner**, I want a dashboard that highlights **Today** and active path clearly, so that I know what to do next.
20. As a **learner**, I want empty dashboard states that guide me to create a path, so that a new account doesn’t feel dead.
21. As a **learner**, I want path overview stages to feel scannable and premium, so that the outline feels like a real curriculum.
22. As a **learner**, I want stage module lists with clear status (ready / generate on open / done), so that lazy generation is understandable.
23. As a **learner**, I want the diagnostic page to look calm and trustworthy, so that placement doesn’t feel like a throwaway form.
24. As a **learner**, I want diagnostic loading to say it’s loading questions (or be instant for pack bank), so that I don’t see fake multi-step theater.
25. As a **learner**, when I submit the diagnostic, I want progress that reflects **scoring → building path outline (L0) → done/navigate**, so that I trust the wait.
26. As a **learner**, when I open a stage that needs L1, I want a single honest “Expanding stage into modules…” state until modules exist, so that I don’t see a checklist restart.
27. As a **learner**, when I open a module that needs L2, I want “Writing your lesson…” until MDX is ready, so that the wait matches the work.
28. As a **learner**, if generation fails, I want a clear error and retry, so that I can recover without refreshing blindly.
29. As a **learner**, I never want progress steps to loop from the start after completing, so that I don’t think the job failed or restarted.
30. As a **learner**, I want optional elapsed time on long waits, so that long Gateway calls feel bounded.
31. As a **learner**, I want the module lesson page to present MDX with strong typography and spacing, so that a 10–15 minute read is pleasant.
32. As a **learner**, I want a sticky table of contents from lesson H2s on desktop, so that I can jump the teaching skeleton sections.
33. As a **learner**, I want “Go deeper” resources capped and visually secondary, so that links don’t overpower the lesson.
34. As a **learner**, I want quiz, notes, and tutor to sit in a clear hierarchy under the lesson, so that the page has a narrative order.
35. As a **learner**, if I have a **legacy** short-card lesson, I still want the upgrade banner and regenerate path, so that old content remains usable.
36. As a **learner**, I want login to match the new visual system, so that auth doesn’t feel like a different product.
37. As a **keyboard user**, I want visible focus states and logical tab order on primary flows, so that I can use the app without a mouse.
38. As a **learner with reduced motion**, I want motion minimized, so that animations don’t distract or harm.
39. As a **learner in dark mode**, I want readable contrast on text, borders, and accents, so that long reading doesn’t strain.
40. As a **returning learner**, I want sign-out and new-path actions easy to find, so that account chores stay simple.
41. As a **product owner**, I want copy updated away from “short lesson cards,” so that marketing matches MDX lessons.
42. As a **developer agent**, I want a pure generation-progress presenter seam, so that honest UX is testable without browser flakiness.
43. As a **developer agent**, I want TOC extraction as a pure helper, so that outline behavior is testable from MDX strings.
44. As a **visitor on mobile**, I want the landing and headers to work in a narrow viewport, so that quality isn’t desktop-only.
45. As a **learner on mobile**, I want the lesson readable without a sticky TOC requirement, so that small screens stay simple (TOC can collapse or sit inline).

## Implementation Decisions

### Design system
- Introduce a small **token layer** (CSS variables / Tailwind theme): background, foreground, muted, border, card, primary (teal accent), primary-foreground, danger, warning, success, ring/focus.
- Support **light and dark** via tokens (class or system strategy—prefer one consistent approach app-wide; document choice in implementation notes).
- **Typography:** keep Geist for app UI and body; add **one display family** for marketing hero/headlines only.
- **Radius, shadow, spacing** scales documented in tokens; avoid one-off magic values on new surfaces.
- Primary actions use accent sparingly; default chrome stays near-neutral.
- Refine existing primitives (button, card, input, label, textarea, badge) to consume tokens rather than hard-coded zinc/teal utilities everywhere.

### Information architecture / chrome
- **Marketing shell:** header with logo, “How it works” anchor (landing), Sign in, primary CTA; footer on marketing pages.
- **App shell:** header with logo → dashboard, Dashboard, New path, user email/sign out (or compact account control).
- No left sidebar / full LMS player in this pass.
- Layout max widths: airy marketing containers; comfortable readable measure for lessons (~prose width); app lists slightly wider where useful.

### Landing page
Sections in order:
1. Hero (headline, subcopy aligned to real product, primary + secondary CTA)
2. Proof strip (3 short claims—no fake user quotes)
3. How it works (3–4 steps: intake, diagnostic, path stages, module lessons + tutor)
4. Feature row (generate / guide & teach / curate—accurate to MDX + max-3 resources)
5. Static path/module mock (non-live decorative UI)
6. Suggested pack (AI Engineering)
7. FAQ (short)
8. Footer

SEO: title, description, basic Open Graph on landing.

### Generation progress (critical)
- Remove looping interval-driven fake checklists as the source of truth.
- Add **Generation progress presenter** (pure module):
  - Input: discrete `phase` (and optional error, `startedAt`)
  - Output: ordered steps with states `pending | active | done | error`, headline, whether to show elapsed time
- Phase vocabulary (product language):
  - `diagnostic_loading`
  - `diagnostic_ready` (no spinner)
  - `diagnostic_scoring`
  - `l0_building`
  - `l0_ready` (navigate away)
  - `l1_building`
  - `l1_ready`
  - `l2_building`
  - `l2_ready`
  - `error`
- UI may show a subset of steps relevant to the current flow (e.g. diagnostic submit shows scoring + L0 only—not L1/L2).
- Elapsed time allowed on long active phases; no percentage unless real.
- On error: show message + retry; do not restart a fake sequence from step 1 as animation theater.
- Wire diagnostic form, ensure-L1, ensure-L2 (and any shared status component) through this presenter.

### Lesson page
- Keep MDX body renderer and allowlisted components (`Callout`, `Steps`, GFM).
- Add **TOC extraction** pure helper: lesson MDX/markdown → `{ id, title }[]` from H2s (slug/id stable enough for in-page anchors).
- Desktop: sticky TOC beside reading column; mobile: inline collapse or top outline—must not break readability.
- Hierarchy: title/meta → actions (complete, regenerate) → legacy banner if needed → lesson → go deeper → quiz → notes → tutor.
- Resources remain visually secondary; no redesign of ranking rules (already max 3, ≤1 video).

### Dashboard / path / stage / login
- Restyle for tokens, hierarchy, empty and error states.
- Dashboard: Today card emphasis; path list clarity; active badge.
- Path/stage: clearer stage cards and module readiness.
- Login: same system, clearer provider buttons and helper text.

### Motion
- Marketing: restrained entrance/hover only; honor `prefers-reduced-motion`.
- App: subtle transitions for real state changes only.

### Copy
- Replace outdated “short lesson cards” language wherever user-facing.
- Use glossary terms: Path, Stage, Module, Lesson, Diagnostic, Pack, Today, etc. (`CONTEXT.md`).

### Testing seams (confirmed)
1. **Generation progress presenter** — primary unit-tested seam.
2. **UI primitives** — tokenized components; build + manual review; no heavy snapshot mandate.
3. **Lesson TOC extraction** — unit-tested pure helper.

### Non-goals for implementation mechanics
- No requirement to change Drizzle schema for this redesign unless a trivial presentational field appears (should not).
- No change to Gateway models, budgets, or L2 MDX generation prompts except copy on loading labels.
- Do not hand-write SQL migrations (project rule).

### ADR / domain touch-ups
- Optionally add a short ADR for “honest generation progress” and/or “marketing vs app shell” if implementer wants permanence; not blocking.
- Update `CONTEXT.md` only if new user-facing terms appear (e.g. “proof strip” should not enter domain glossary—keep glossary product-domain only).

## Testing Decisions

### What good tests look like
- Assert **external behavior** of pure helpers (inputs → outputs).
- Do not test Tailwind class strings, pixel layout, or implementation private state.
- Do not require Playwright for this spec’s merge bar; manual pass on light/dark + mobile width is enough for visual.

### Modules to test
1. **Generation progress presenter**
   - Each phase produces expected active/done/pending pattern.
   - Error phase marks error without inventing loop-back-to-start behavior.
   - Flow-specific subsets (diagnostic submit vs L2-only) don’t show irrelevant future stages as “failed.”
   - Elapsed flag / headline stability as defined by API.
2. **Lesson TOC extraction**
   - Extracts H2 titles from sample MDX with teaching skeleton headings.
   - Ignores H3 or handles consistently per documented rule (prefer H2-only).
   - Empty/malformed input → empty list.
   - Ids are unique and anchor-safe.

### Prior art
- Existing Vitest suites for pure learning helpers (`generation` seam tests, `lesson-format`, `rank-resources`, `structured` extract).
- Follow the same Vitest + `pnpm test` pattern; keep tests node environment.

### Manual / production checklist (not automated unless easy)
- Landing light/dark, mobile nav, CTA targets.
- Diagnostic → L0 wait does not loop.
- L1/L2 waits honest; error + retry.
- Lesson TOC jumps work on desktop.
- Focus rings visible on buttons/inputs.
- Reduced motion: no large motion mandatory to understand UI.

## Out of Scope

- Full LMS course player with persistent stages/modules sidebar.
- Real testimonials, logos of customers, or fabricated social proof.
- Analytics, A/B testing, marketing pixel stack.
- Comprehensive e2e/Playwright suite.
- Rebuilding auth providers or Supabase configuration.
- Changing L2 MDX skeleton pedagogy, resource ranking policy, or diagnostic caching logic (already shipped)—except loading **presentation**.
- New packs beyond existing AI Engineering entry.
- Native mobile apps.
- Internationalization.
- Replacing MDX with another content format.
- Performance budget program / image CDN overhaul (beyond not shipping huge unoptimized assets on the landing mock).

## Further Notes

### Grill locks (source of truth for taste)
- Q1: tokens/components first, then full surface.
- Q2: hybrid vibe (editorial/expressive marketing + calm app).
- Q3: light and dark both designed.
- Q4: real generation stages only.
- Q5: landing clarity → desire → CTA.
- Q6: near-neutral + teal accent.
- Q7: Geist + display on marketing.
- Q8: airy marketing / comfortable app.
- Q9: expressive marketing, subtle app.
- Q10: visual + honest generation UX + empty/error + a11y + landing SEO.
- Q11: standard landing sections tightened.
- Q12: marketing header ≠ app header.
- Q13: reading column + sticky H2 TOC; full player later.
- Q14: mood Linear craft + Stripe marketing clarity + calm reading apps; implement freehand from tokens.
- Q15: phase map accepted (diagnostic / L0 / L1 / L2 / error).

### Suggested implementation order for the agent
1. Tokens + primitive restyle.
2. Generation progress presenter + replace fake checklist UI.
3. Shells (marketing vs app header/footer).
4. Landing page.
5. Dashboard / path / stage / login polish.
6. Lesson TOC + lesson page hierarchy polish.
7. Copy pass + SEO + manual checklist.

### Mood (not strict clones)
Linear-like craft in the app; Stripe-like clarity on marketing; calm long-form reading for lessons.

### Related docs
- Domain glossary: `CONTEXT.md`
- MDX lessons ADR: `docs/adr/0001-mdx-module-lessons.md`
- Issue tracker: local markdown under `.scratch/` (`docs/agents/issue-tracker.md`)
