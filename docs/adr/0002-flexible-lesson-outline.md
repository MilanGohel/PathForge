# ADR 0002 — Flexible teaching outline + optional Mermaid

## Status

**Accepted** — 2026-08-16

**Supersedes:** [ADR 0001](./0001-mdx-module-lessons.md)

## Context

ADR 0001 made MDX the L2 body with a **fixed teaching skeleton** (exact H2 titles). That improved on short cards, but every module TOC looked identical and depth could not breathe. Diagrams were not supported. Desktop sticky “On this page” also failed because the absolute TOC rail had no scroll range.

## Decision

- Keep MDX as the primary lesson body (from ADR 0001).
- Replace fixed H2 titles with **soft pedagogical intents** (motivation, core idea, how to think, worked example, common mistake, practice). The model chooses topic-specific headings; merge/split/extra H2s are allowed.
- Soft length via `est_minutes` (~8–20 min aim); no hard length reject.
- **Thinness** validation (≥3 H2s, ≥400 body chars, no empty sections) replaces exact-title completeness.
- Optional fenced ` ```mermaid ` blocks (0–2), model judgment only; fail → code-block chrome fallback. No server diagram gate.
- Fix sticky TOC layout so the rail stays visible while scrolling; TOC remains H2-only from actual titles.
- Cached lessons change only on explicit regenerate.

## Considered options

- Keep fixed exact H2 titles — rejected: every TOC looked identical; modules could not breathe.
- Fully free outline with no intents — rejected: risks thin blog posts and weak “learn from the module alone.”
- Soft intents + free titles — accepted.
- Force a diagram every module — rejected by product; optional judgment only.

## Consequences

- L2 prompt and thinness validation replace exact-title skeleton checks.
- TOC remains dynamic H2 extraction; sticky rail must work with variable-length outlines.
- Mermaid is a client render path with code-fence fallback.
- Old fixed-title MDX remains valid until the learner regenerates.
