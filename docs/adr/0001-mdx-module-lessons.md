# ADR 0001 — MDX module lessons (not short cards)

## Status

**Superseded by [ADR 0002](./0002-flexible-lesson-outline.md)** — 2026-08-16

The MDX-as-primary-body decision still holds. The **fixed teaching skeleton titles** decision does not; see 0002 for soft pedagogical intents and free H2 wording.

## Context

v0 L2 used five fixed card kinds with short bodies plus up to eight search/YouTube links. Learners could not learn the topic from the module alone; the page felt like thin predefined sections plus a link dump.

## Decision (historical)

- L2 primary body is **MDX** with a **fixed teaching skeleton** (~10–15 min teachable read).
- Allowlisted MDX components only: `Callout`, `Steps` (+ normal GFM).
- Drop separate L2 card kinds for new generations.
- External resources: Serper (+ optional YT), **rank/cap to 3**, **≤1 video**.
- Legacy card lessons keep rendering; show upgrade banner; full format only on **Regenerate**.
- Quiz remains structured JSON below the lesson.
- Single strong-model call returns `{ mdx, quiz, resourceQueries }`.

## Consequences

- Higher L2 token cost and latency; better learning outcomes than cards.
- Fixed titles later made every module feel templated — addressed in ADR 0002.
