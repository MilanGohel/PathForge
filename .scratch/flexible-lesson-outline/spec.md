# Spec: Flexible lesson outline + optional Mermaid + sticky TOC fix

Status: ready-for-agent

## Problem Statement

From the learner’s perspective, every Pathforge module lesson feels like the same article with different filler:

- **Identical H2 titles** on every module (“Why this matters”, “The idea”, “How to think about it”, “Worked example”, “Common mistake”, “Try this”, optional “When you're ready”). The side “On this page” rail always lists the same words, so orientation does not reflect the actual topic.
- **Depth cannot breathe.** Some modules deserve a short sharp lesson; others need more sections. The fixed skeleton forces empty-feeling padding or crushes richer topics into the same six buckets.
- **No diagrams when they would help.** Flows, comparisons, and mental models that would benefit from a small chart stay as walls of prose. The product should allow optional Mermaid when it truly helps—not force art on every module.
- **Desktop TOC does not stick on laptop.** “On this page” is supposed to stay visible while scrolling the lesson; the absolute margin-rail + sticky combo collapses so the rail scrolls away.

ADR 0001 locked a **fixed teaching skeleton**. That improved on short cards, but the fixed *titles* are now the main sameness problem. Pedagogy should stay; cookie-cutter headings should go.

## Solution

1. **Soft pedagogical intents, free H2 titles.** Every new L2 lesson must still cover six intents (motivation, core idea, how to think, worked example, common mistake, practice). The model **chooses its own H2 wording**, may **merge** intents into fewer sections, and may **add** extra topic-specific H2s. No exact title list is required in the MDX.
2. **Length follows the module.** Soft guidance using `est_minutes` / blurb; short modules stay short; no hard auto-reject on length.
3. **Thinness validation replaces exact-title completeness.** Banner when the lesson is structurally thin (≥3 H2s and enough body text required); drop “missing Why this matters…” checks.
4. **Optional Mermaid (0–2), model judgment only.** Fenced ` ```mermaid ` blocks only; never required. Invalid diagrams fall back to showing the source as code.
5. **Fix desktop sticky TOC** so the rail stays in view while scrolling the lesson (layout bug, not a product rethink). TOC remains **H2-only**, built from whatever titles the lesson actually has.
6. **Cache non-negotiable:** existing lessons stay as-is until **explicit Regenerate** (or first generate for new modules). No silent rewrite.
7. **Docs:** new ADR superseding 0001; update CONTEXT glossary (Teaching skeleton / Lesson).

## User Stories

### Flexible outline

1. As a **learner opening different modules**, I want section titles that match the topic (not the same six labels every time), so that the outline feels written for this lesson.
2. As a **learner on a small foundational module**, I want a shorter lesson that still teaches, so that I am not reading padded empty sections.
3. As a **learner on a denser module**, I want more or deeper sections when the topic needs it, so that I can learn from the module alone.
4. As a **learner**, I still want lessons that cover motivation, the core idea, how to think about it, a worked example, a common mistake, and something to try—even if those appear under different headings or merged sections—so that quality does not collapse into a random blog post.
5. As a **learner**, I want the model free to add extra H2s (e.g. a comparison table section, a checklist), so that topic-specific structure is allowed.
6. As a **learner**, I want optional “when you’re ready / next steps” style closings only when useful, so that endings are not mandatory boilerplate.

### Validation and honesty

7. As a **learner on a thin or broken lesson**, I want a clear quality banner (not a list of missing legacy titles), so that I know regenerate may help.
8. As a **learner**, I do not want a false “incomplete” banner on a good short lesson that simply used custom H2s, so that free titles are first-class.
9. As a **learner on a legacy short-card lesson**, I still want the existing upgrade path via Regenerate, so that old rows remain recoverable.
10. As a **learner on an old fixed-skeleton MDX lesson**, I want it to keep rendering until I regenerate, so that content does not change under me.

### Mermaid

11. As a **learner**, I want optional diagrams when they clarify a flow/relationship, so that complex ideas scan faster.
12. As a **learner**, I do not want a diagram forced into every module, so that simple lessons stay clean.
13. As a **learner**, I want at most a couple of diagrams per lesson, so that generation does not turn into a chart dump.
14. As a **learner when a diagram fails to render**, I want to see the Mermaid source as a normal code block (and a light failure hint if cheap), so that the rest of the lesson still works.
15. As a **learner**, I want diagrams themed reasonably for light/dark, so that charts are readable in both themes when feasible.

### TOC and reading chrome

16. As a **learner on a laptop/desktop**, I want “On this page” to stay sticky while I scroll the lesson, so that I can jump sections without losing the rail.
17. As a **learner**, I want the TOC to list this lesson’s real H2 titles, so that the rail matches the article.
18. As a **learner**, I want H2-only TOC (not every H3), so that the rail stays scannable.
19. As a **learner on mobile**, I want the existing collapsible “On this page” control preserved, so that small screens stay simple.
20. As a **learner using active-section highlighting**, I want it to keep working with free titles and sticky layout, so that orientation does not regress.

### Tutor and regenerate

21. As a **learner opening an empty tutor**, I want suggested prompts that mix this lesson’s real H2s with generic practice/pitfall prompts, so that suggestions stay useful after free titles.
22. As a **learner regenerating a lesson**, I want the new flexible outline + optional Mermaid rules applied, so that regenerate is how I opt into the new format.
23. As a **learner regenerating with optional direction**, I want direction to still apply on top of the new prompt rules, so that v1 regenerate-with-direction keeps working.

### Product / docs continuity

24. As a **product maintainer**, I want ADR 0001 superseded by a new ADR, so that the fixed-title decision is not left as current truth.
25. As a **product maintainer**, I want CONTEXT glossary terms updated (Lesson, Teaching skeleton → soft intents), so that agents and humans share language.
26. As a **learner**, I want quiz, resources (max 3), notes, mark complete, and module-grounded tutor behavior unchanged, so that this change is about lesson body shape—not a platform rewrite.
27. As a **learner**, I want no silent regeneration of cached lessons, so that non-negotiables hold.

### Edge cases

28. As a **learner on a lesson with only one weak H2**, I want thinness validation to flag it, so that empty generations are visible.
29. As a **learner on a lesson with many H2s**, I want the sticky TOC to remain usable (scrollable rail if needed), so that long outlines do not break the layout.
30. As a **learner when MDX compile fails**, I want the existing markdown fallback to still work, including tables and mermaid fences as code if the diagram component cannot run in fallback, so that hard failures degrade gracefully.

## Implementation Decisions

### Docs (do first in the change set)

- Add **ADR 0002 — Flexible teaching outline + optional Mermaid** with status Accepted; mark **ADR 0001** as **Superseded by 0002**.
- Update `CONTEXT.md`:
  - **Lesson**: MDX teachable body; outline is model-chosen H2s covering soft pedagogical intents; length scales with module.
  - Replace fixed **Teaching skeleton** definition with **Pedagogical intents** (soft skeleton): motivation, core idea, how to think, worked example, common mistake, practice — titles free; merge/split/extra H2s allowed.
  - Note optional Mermaid diagrams (not required).
- Do not put implementation detail in CONTEXT; keep ADR for trade-offs.

### Generation prompt (L2)

- Replace `LESSON_SKELETON_PROMPT` / exact H2 mandate with a **soft-intents prompt**:
  - Must teach the module standalone (~read time guided by `estMinutes`, typically ~8–20 min soft aim—not a hard reject).
  - Must cover the six intents (list as intents, not required strings).
  - **Choose clear, topic-specific H2 titles**; do not reuse a generic template for every module.
  - May merge intents into fewer H2s; may add extra H2s when useful.
  - Prefer plain language; code only when it helps.
  - **Mermaid:** optional fenced ` ```mermaid ` blocks only when a diagram materially helps; **0–2 max**; never invent diagrams for decoration; if unsure, skip.
  - Keep allowlisted MDX: `Callout`, `Steps`, GFM (including tables). No import/export, raw scripts, unknown components.
  - Still return structured `quiz` + `resourceQueries` as today.
- Pass through existing optional regenerate `direction` the same way.
- Single strong-model L2 call remains the generation seam (`LearningGeneration`).

### Pure seams (prefer extend existing)

1. **`presentLessonThinness` (replace or reshape `presentSkeletonCompleteness`)**  
   Input: MDX string.  
   Output: `{ thin: boolean; reasons: string[] }` (or keep `complete` inverted for less UI churn).  
   Rules (locked):
   - Count H2s (same fence-aware parsing spirit as TOC).
   - **thin** if H2 count &lt; 3 **or** non-heading body text &lt; 400 chars **or** any H2 has empty body (next H2/EOF with no substantial text).
   - Do **not** require legacy title strings.
   - Export constants for thresholds next to the function for tests.

2. **`extractLessonToc`**  
   Unchanged contract (H2-only); tests should use varied titles, not only legacy skeleton list. Keep `slugifyHeading` + unique ids.

3. **`sanitizeLessonMdx`**  
   Keep stripping import/export/scripts/unknown HTML. Mermaid is a **fenced code language**, not a new HTML tag—ensure fences are not destroyed. No need to allow a `<Mermaid>` HTML tag (fence-only).

4. **Tutor suggestions helper (pure, small)**  
   Input: TOC titles (string[]).  
   Output: 3 prompt strings — mix **up to 2 from real H2 titles** + **at least 1 generic** (practice / common mistake / explain simply). Deterministic ordering for tests.

### Mermaid UI

- Add dependency only if required (`mermaid` client-side).
- Client component for fenced mermaid: detect `language-mermaid` in code/pre pipeline (coordinate with `PreBlock` / MDX `pre`+`code`).
- On success: render SVG/diagram inside a bordered rounded container; attempt light/dark friendly theme (mermaid theme variables or class).
- On failure: fall back to existing code-block chrome with source text; optional one-line “Diagram could not be rendered”.
- Lazy-load mermaid so modules without diagrams do not pay the full cost up front when practical.
- Never block lesson render on mermaid load error.

### Sticky TOC layout fix

- Root cause: desktop TOC sits in an `absolute` aside whose box height ≈ TOC height, so `position: sticky` has no scroll range.
- Fix approach (implementer may choose equivalent):
  - Give the sticky rail a **containing block that spans the lesson column height** (e.g. absolute inset-y on the relative lesson wrapper, or a grid/flex layout where the sticky element’s parent is as tall as the article), **and**
  - `sticky` with `top` offset under the app header (e.g. `top-20` accounting for h-14 header + progress bar).
- If the TOC is longer than the viewport, make the nav itself `max-h-[calc(100vh-…)] overflow-y-auto` so sticky + inner scroll both work.
- Preserve mobile collapsible TOC; desktop breakpoint behavior stays (xl/lg as currently used—keep one consistent breakpoint with the module page).
- Active section IntersectionObserver remains.

### Module page / banners

- Replace skeleton-missing-titles banner with **thin lesson** banner + regenerate CTA when `presentLessonThinness` says thin.
- Do not treat “uses old six titles” as an error; those lessons are valid until user regenerates.
- Legacy **cards** banner unchanged.

### Tutor

- Stop importing fixed `LESSON_SKELETON_HEADINGS` for suggestions; use TOC titles from the open lesson (pass props from module page) + pure suggestion helper.
- Challenge me / streaming / stop / retry unchanged.

### Marketing copy

- Soft-update any landing line that promises a fixed skeleton wording if it would become false (e.g. homepage “teaching skeleton” claim). Prefer “teachable modules with a clear outline” over listing the six old titles.

### Non-goals for implementation mechanics

- No schema/migration required (MDX string already stores arbitrary headings).
- No forced bulk regenerate.
- No server-side mermaid validation gate on generate.
- No H3 in TOC for v1 of this change.
- No new diagram DSLs (PlantUML, etc.).

### Testing Decisions

What good tests look like:

- Pure functions only at seams; table-driven cases.
- No golden-file full MDX snapshots unless tiny fixtures.
- No live model calls; generation tests mock `ModelClient` if prompt wiring is asserted lightly.

Modules / cases:

- **`presentLessonThinness`**: empty; 2 H2s; 3 H2s but &lt;400 body chars; empty section between H2s; healthy varied-title lesson; legacy six-title lesson is **not** thin if body is rich.
- **`extractLessonToc`**: varied titles; unique slugs; ignore H3; ignore fenced content.
- **Tutor suggestion helper**: 0 titles → all generic; 1 title → mix; many titles → two specific + generic; stable order.
- **sanitize**: still strips `import`; leaves ` ```mermaid ` fences intact.
- Update/remove tests that required exact `LESSON_SKELETON_HEADINGS` presence as completeness.
- Manual: sticky TOC on laptop width while scrolling long lesson; mermaid happy path + intentional bad mermaid fallback; regenerate one old module and confirm new outline titles appear in TOC.

Prior art: `lesson-format.test.ts`, `lesson-toc.test.ts`, generation progress presenter tests.

## Out of Scope

- Spaced review, path revise, freemium (v2)
- Auto-regenerating the catalog to the new outline
- Server-side mermaid CI validation as a merge gate for content
- H3 TOC, print CSS overhaul, full prose redesign
- Additional diagram languages
- Changing resource cap, quiz gating, or honor-system complete
- Reopening button/theme design tokens

## Further Notes

### Grill locks (source of truth for this spec)

| ID | Decision |
|----|----------|
| Q1 | Soft pedagogy, **free H2 titles** (not fixed strings; not fully free-form without intents) |
| Q2 | Optional Mermaid, model judgment, not forced |
| Q3 | **Fix sticky** TOC (keep side rail) |
| Q4 | **Six intents** checklist; merge allowed |
| Q5 | Soft length + light `est_minutes` in prompt; no hard length reject |
| Q6 | Thinness checks (≥3 H2, body size, empty sections)—not exact titles |
| Q7 | Mermaid fail → show source as code |
| Q8 | **New ADR** supersedes 0001 + CONTEXT update |
| Q9 | Cached lessons unchanged until explicit regenerate |
| Q10 | Tutor suggestions = **mix** real H2s + generic |
| Q11 | Thresholds: **≥3 H2s**, **≥400** chars body, no empty H2 sections |
| Q12 | TOC **H2 only** |
| Q13 | **Fenced mermaid only** (no `<Mermaid>` component required) |

### Suggested implement order

1. ADR 0002 + CONTEXT glossary  
2. Thinness presenter + tests; swap module banner  
3. L2 prompt soft-intents + mermaid guidance  
4. Mermaid client render + fallback  
5. Sticky TOC layout fix  
6. Tutor suggestion helper + wiring  
7. Marketing copy touch-up  
8. `pnpm test` / typecheck / build; manual sticky + mermaid check  

### Definition of done

- New/regenerated lessons show **topic-specific H2s** in the article and TOC while still feeling teachable.  
- Optional mermaid appears only when the model chooses; bad diagrams do not brick the page.  
- Desktop “On this page” **stays visible** while scrolling on laptop.  
- Old lessons unchanged until regenerate.  
- ADR/CONTEXT reflect the new domain language.  
- Thin lessons warn without demanding legacy titles.
