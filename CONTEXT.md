# Pathforge — domain context

## What it is

Pathforge is an AI learning product: a learner states what they want to learn; the system builds a personalized path and teaches along it with generated lessons, curated external resources, progress, and a module-scoped tutor.

## Glossary

| Term | Meaning |
|------|---------|
| **Path** | A full learning journey for one topic/goal owned by a user |
| **Stage** | Ordered group of modules inside a path (e.g. "ML Fundamentals") |
| **Module** | One learnable unit; contains lesson cards, resources, optional quiz, notes, tutor thread |
| **Lesson** | Short card-based content generated at L2 for a module |
| **Pack** | Suggested entry point (v0: AI Engineering only). Packs set defaults + optional fixed diagnostic; **all course body is still AI-generated** |
| **Intake** | Topic + goal + hours/week + optional deadline |
| **Diagnostic** | Placement quiz before path outline (fixed bank for pack; LLM-generated for free-prompt) |
| **L0–L4** | Lazy generation levels (outline → stage modules → module body → tutor → daily blurb) |
| **Mark complete** | Honor-system completion; quizzes do not gate progress |
| **Today** | Rule-picked next incomplete module (+ optional short AI blurb) |
| **Challenge me** | Tutor mode that asks one practice question at a time |
| **Domain alert** | Rare creation-time notice when a topic is hard to learn well online (hands-on / physical / clinical). Not shown on marketing. |

## Non-negotiables

- Never silently regenerate cached content; regenerate only on explicit user action
- Token-efficient: generate on demand, persist everything, server-side budgets
- Production auth + RLS from day one (Supabase)
- Models via Vercel AI Gateway; web search via Serper; YouTube API when videos are needed
