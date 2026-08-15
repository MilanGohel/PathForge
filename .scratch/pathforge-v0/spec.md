Status: ready-for-agent

# Pathforge v0 — Product Spec

## Problem Statement

People who want to learn something new (a skill, a career shift, a curiosity topic) can get a rough plan from a chatbot, but that plan disappears into chat history. It is not structured into stages and modules, does not remember what was already generated, does not track progress day to day, does not teach in small finishable lessons, and does not reliably attach real learning resources. Existing roadmap sites are static and generic; course marketplaces are fixed catalogs. The learner needs a durable, personalized path that is generated for them, guided daily, taught in short lessons, and backed by curated external resources — without burning excessive AI tokens by generating an entire course up front.

## Solution

Pathforge is a web app where a learner signs in, says what they want to learn (or starts the suggested AI Engineering pack), completes a short placement diagnostic, and receives a personalized path outline (stages first). As they open stages and modules, the system lazily generates module lists, short lesson cards, optional practice questions, and real web/video resources. Progress is mark-complete based; a “Today” recommendation always points at the next useful module. A module-scoped tutor can explain and run “challenge me” drills using the saved lesson as ground truth. Everything generated is stored so returning is free; regeneration is explicit and budgeted.

## User Stories

1. As a visitor, I want to understand what Pathforge does from the landing page, so that I know whether to sign up.
2. As a visitor, I want to see that AI Engineering is a suggested pack, so that I have a concrete starting point.
3. As a visitor, I want to sign in with Google, so that I can access my paths quickly.
4. As a visitor, I want to sign in with GitHub, so that I can use my developer identity.
5. As a signed-in user, I want to be redirected away from auth pages when already signed in, so that I am not stuck in loops.
6. As a signed-in user, I want a home that lists my paths, so that I can resume prior learning.
7. As a signed-in user, I want one path treated as active with a strong Continue CTA, so that I am not overwhelmed by multi-path UI while dogfooding.
8. As a learner, I want to start from the AI Engineering pack suggestion, so that intake is pre-filled with sensible defaults.
9. As a learner, I want to type any topic I want to learn, so that I am not limited to packs.
10. As a learner, I want to state my goal (job, project, curiosity, exam, etc.), so that the path matches intent.
11. As a learner, I want to set hours per week, so that estimates and pacing fit my life.
12. As a learner, I want an optional deadline, so that the plan can reflect time pressure when I have it.
13. As a learner, I want a short diagnostic after intake, so that the path starts at the right depth.
14. As a pack learner, I want a fixed diagnostic question bank for AI Engineering, so that placement is stable and cheap.
15. As a free-prompt learner, I want an LLM-generated diagnostic of 5–8 questions, so that any topic can still be placed.
16. As a learner, I want diagnostic results to influence which stages I should focus on or skip conceptually, so that I do not repeat what I know.
17. As a learner, I want to see a path outline with stages only after diagnostic (L0), so that I get a fast first result without waiting for a full course.
18. As a learner, I want estimated total hours on the path, so that I can judge commitment.
19. As a learner, when a topic is genuinely hard to learn well only online (e.g. needs physical practice), I want a clear alert at path creation, so that I set realistic expectations.
20. As a learner, I do not want soft-skill or marketing copy telling me domains are “weak,” so that the product feels confident and not naggy.
21. As a learner, I want stepped loading states while generation runs, so that I know the system is working.
22. As a learner, I want streamed content as it is produced, so that I am not staring at a blank spinner.
23. As a learner, I want to open a stage and only then generate its modules (L1), so that tokens are spent on what I actually explore.
24. As a learner, I want each module to show a title, one-line blurb, and estimated minutes, so that I can pick what to do next.
25. As a learner, I want to open a module and receive short lesson cards (L2), so that I can learn in one sitting.
26. As a learner, I want cards covering concept, why it matters, example, pitfall, and a try-this prompt, so that the lesson is practical.
27. As a learner, I want external resources (articles, videos, books when found) on the module, so that I can go deeper beyond AI text.
28. As a learner, I want resources grounded in real search results, so that links are not hallucinated.
29. As a learner, I want video resources resolved to real YouTube results when we enable that pass, so that embeds/links work.
30. As a learner, I want an optional quiz on the module page, so that I can check understanding without being blocked.
31. As a learner, I want to mark a module complete without passing a quiz, so that progress stays under my control.
32. As a learner, I want to add personal notes on a module, so that I can capture my own wording and reminders.
33. As a learner, I want returning to a module to load saved lesson/resources instantly, so that I never pay generation cost twice by default.
34. As a learner, I want an explicit regenerate action for a module or outline, so that I can retry bad output when needed.
35. As a learner, I want regenerate to respect server-side budgets, so that runaway costs are limited.
36. As a learner, I want a Today recommendation for the next incomplete module, so that I always know what to do now.
37. As a learner, I want an optional short AI blurb on Today, so that the nudge feels human without a heavy plan job.
38. As a learner, I want path progress (percent / stages done) on the dashboard, so that I can see momentum.
39. As a learner, I want a module-scoped tutor chat, so that I can ask questions about the current lesson only.
40. As a learner, I want the tutor grounded on the saved lesson content, so that answers stay on-curriculum.
41. As a learner, I want “Challenge me” in the tutor, so that I can get one practice question at a time.
42. As a learner, I want tutor threads persisted per module, so that I can resume a conversation.
43. As a learner, I want multiple paths in the database model, so that I can start another topic later without losing the first.
44. As a learner, I want pack starts and free-prompt starts to feel consistent after creation, so that there is one learning UX.
45. As a dogfooding learner, I want to complete every module in my active path slice via mark complete, so that I finish a real path in ~3 weeks.
46. As a dogfooding learner, I want to use optional quiz at least once and tutor/challenge at least once, so that teach features are proven.
47. As a portfolio visitor (via README/demo), I want to understand the architecture and loop, so that the project reads as production-minded.
48. As the product owner, I want all user data protected with RLS, so that users only read/write their own rows.
49. As the product owner, I want generation events logged for budget enforcement, so that limited tokens last through dogfood.
50. As the product owner, I want cheaper/faster models for outlines and stronger models for lessons via the gateway, so that quality and cost balance.
51. As the product owner, I want no dependency on any external hand-written curriculum file for AI Engineering, so that the product AI is the source of course content.
52. As a learner on a failed generation, I want a clear retry path, so that a single model/search failure does not brick the module.
53. As a learner, I want stages and modules ordered stably, so that navigation is predictable.
54. As a signed-out user, I want protected learning routes to send me to sign-in, so that private data is not exposed.
55. As a learner, I want resource items to show title, kind, and openable URL, so that curation is usable.
56. As a learner, I want to skip deep engagement with tutor/quiz and still complete modules, so that busy days still count.
57. As a learner, I want the AI Engineering pack to still run full L0–L2 generation, so that the pack is not a static course dump.
58. As a developer agent, I want a single generation service seam, so that behavior is testable without the UI.
59. As a developer agent, I want env-based configuration for Supabase, AI Gateway, Serper, and YouTube, so that secrets never ship to the client inappropriately.
60. As a learner, I want cancel or safe navigate-away during long generation when possible, so that I am not trapped on a generating screen (best-effort; partial persist if streaming landed).

## Implementation Decisions

### Product / UX
- App name and folder: Pathforge.
- Ambition is portfolio + learning project, not payments or multi-tenant edtech.
- Learn-anything via prompt; single suggested pack: AI Engineering.
- Pack does not ship pre-written lessons; it ships metadata, defaults, and a fixed diagnostic bank only.
- Hierarchy is Path → Stages → Modules → Lesson cards.
- Completion is honor-system mark complete; optional quiz never gates.
- Lesson format is short cards, not long-form articles.
- Daily guide is rule-based next incomplete module plus optional one-line blurb.
- Tutor is module-scoped with Challenge me mode.
- Loading UX combines stepped status and streaming content.
- Domain alert only at creation for clearly poor pure-online fit; silent otherwise; no landing disclaimers about soft gates.
- v0 screens: landing, auth, intake, diagnostic, path dashboard, stage, module, tutor, pack gallery, multi-path list, regenerate, domain alert.
- Active-path-oriented home even though multi-path is supported.

### Architecture
- Next.js App Router application hosted on Vercel.
- Supabase-centric data and auth (Postgres, Auth, Storage as needed).
- Auth providers: Google and GitHub.
- Models exclusively through Vercel AI Gateway using Vercel AI SDK primitives for streaming and structured object generation.
- Web resource search through Serper; YouTube Data API added when video quality requires it.
- UI kit: shadcn/ui with Tailwind v4.
- No background job system in v0 unless generation timeouts appear during dogfood; prefer request-time generation with persistence of results.
- **Primary module:** a Learning Generation service that owns cache lookup, budget checks, L0–L4 prompts, structured outputs, search orchestration, and persistence calls.
- Route handlers / server actions are thin adapters over that service and Supabase repositories.
- Pack templates are DB (or seed) metadata; starting a pack creates a user-owned path instance then runs L0.

### Lazy generation contract
- L0 after intake+diagnostic: path metadata + ordered stages only; persist immediately.
- L1 when a stage is opened: modules for that stage only; persist; no-op if cached.
- L2 when a module is opened: cards + quiz items + resources; persist; no-op if cached.
- L3 when tutor opens: stream replies with lesson in context; persist messages.
- L4 optional for Today blurb only; module pick is rules, not full regen.
- Explicit regenerate invalidates the chosen level’s cache entry and re-runs under budget.

### Data model (logical)
- profiles linked to auth users.
- pack_templates for suggested packs.
- paths owned by user_id with intake fields, L0 payload/status, optional domain_alert, active flag.
- stages under paths with position and L1 status/payload.
- modules under stages with position, blurbs, L2 status, completed_at.
- lessons (cards json), resources, notes, quiz items/attempts, tutor threads/messages.
- generation_events for auditing and daily caps.
- RLS: users can only access their own path trees and related rows; pack_templates readable by authenticated users.

### API / interaction contracts (conceptual)
- Create path from pack or prompt → run diagnostic → L0 → redirect dashboard.
- GET/open stage → ensure L1.
- GET/open module → ensure L2.
- POST mark complete / notes / quiz attempt.
- POST regenerate(level, id).
- POST tutor message / challenge.
- GET today for active path.

### Token efficiency
- Never regenerate on read.
- Prefer smaller/faster gateway models for L0/L1/titles; stronger for L2 lessons and tutor.
- Server-side per-user daily generation budget; no consumer usage meter UI in v0.
- Search only on L2 (and regenerate), not on every page view.

### Explicit content policy
- Do not import hand-authored full curricula from other repos (including any local AI engineering learning notes). AI Engineering content is generated by Pathforge’s own pipeline.

## Testing Decisions

### What good tests look like
- Test observable behavior at service and policy boundaries, not private prompt string internals or React markup structure.
- Prefer deterministic fakes for the model gateway and search provider.
- Assert cache and budget behavior explicitly (second call does not hit model; regenerate does; budget error is clean).

### Primary seam: Learning Generation service
With fake model, fake search, fake budget, and in-memory or test repository:
- L0 produces stages without modules/lessons.
- Opening stage performs L1 once; second open is cache hit.
- Opening module performs L2 once; includes cards and resources derived from search fake.
- Mark complete is orthogonal to quiz attempts.
- Today selects the first incomplete module in order.
- Diagnostic (pack bank) returns a placement result consumed by L0 prompting.
- Free-prompt diagnostic path requests structured questions then scores placement.
- Budget exhausted returns a controlled error without partial silent corruption.
- Regenerate forces a new model call and replaces stored payload.
- Domain alert classifier result is stored and surfaced only on creation response when positive.

### Secondary seam: repositories + auth
- Authenticated user can CRUD only own paths (integration test when Supabase test env exists).
- Signed-out access to protected procedures fails.

### UI
- Optional smoke later; not required to accept the generation service.

### Prior art
- Greenfield repo: no existing test suite. Establish service-level tests first when implementation starts.

## Out of Scope

- Payments, subscriptions, entitlements
- Native mobile apps
- Social features, friends, leaderboards
- Teachers, teams, classrooms, assignments
- Full adaptive re-planning of the entire path after every activity
- Public path sharing, SEO content mill, embed widgets
- Offline-first / PWA sync
- Admin CMS for writing pack lessons by hand
- Additional curated packs beyond AI Engineering metadata
- User-facing token/cost meter
- Settings area, marketing blog, onboarding tour polish beyond the core loop
- Background job platform (unless dogfood timeouts force a follow-up spec)
- Importing or syncing external curriculum markdown as source of truth

## Further Notes

### Success checklist (dogfood)
- [ ] Signed in with production-style OAuth against Supabase
- [ ] Started AI Engineering via pack (AI-generated L0+)
- [ ] Completed diagnostic
- [ ] Expanded multiple stages/modules with cache verified on revisit
- [ ] Marked all modules in the active finishable run complete
- [ ] Used optional quiz ≥ once
- [ ] Used tutor or Challenge me ≥ once
- [ ] README case study + demo walkthrough notes

### Test seams — confirmation
Primary seam is the **Learning Generation service** (model + search + budget + path store). Confirm or amend before large test implementation.

### Tracker
Published as local markdown under `.scratch/pathforge-v0/` with status `ready-for-agent`.
